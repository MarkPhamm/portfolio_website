// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import styles from "./Cursor.module.scss";
import { useEffect, useRef, useCallback } from "react";
import { gsap, Linear } from "gsap";
import { IDesktop, isSmallScreen } from "pages";

const CURSOR_STYLES = {
  CURSOR: "fixed hidden bg-white w-4 h-4 select-none pointer-events-none z-50",
  FOLLOWER: "fixed hidden h-8 w-8 select-none pointer-events-none z-50",
  GLOW: "fixed hidden select-none pointer-events-none z-40",
};

const Cursor = ({ isDesktop }: IDesktop) => {
  const cursor = useRef<HTMLDivElement>(null);
  const follower = useRef<HTMLDivElement>(null);
  const followerLabel = useRef<HTMLSpanElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  const onHover = (e: Event) => {
    const target = e.currentTarget as HTMLElement;
    const cursorType = target.getAttribute("data-cursor");

    gsap.to(cursor.current, {
      scale: 0.5,
      duration: 0.3,
    });

    if (cursorType === "view") {
      // Expand follower into labeled circle
      gsap.to(follower.current, {
        width: 80,
        height: 80,
        marginLeft: -40,
        marginTop: -40,
        backgroundColor: "rgba(145, 70, 255, 0.25)",
        borderColor: "rgba(145, 70, 255, 0.6)",
        borderWidth: 1,
        duration: 0.3,
      });
      if (followerLabel.current) {
        followerLabel.current.textContent = "View";
        gsap.to(followerLabel.current, { opacity: 1, duration: 0.2 });
      }
    } else {
      gsap.to(follower.current, {
        scale: 3,
        duration: 0.3,
      });
    }
  };

  const onUnhover = () => {
    gsap.to(cursor.current, {
      scale: 1,
      duration: 0.3,
    });
    gsap.to(follower.current, {
      scale: 1,
      width: 32,
      height: 32,
      marginLeft: 0,
      marginTop: 0,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderColor: "transparent",
      borderWidth: 0,
      duration: 0.3,
    });
    if (followerLabel.current) {
      gsap.to(followerLabel.current, { opacity: 0, duration: 0.15 });
    }
  };

  // Track which magnets are currently "pulled" so we only emit a reset
  // tween once when leaving the zone, not on every mousemove.
  const activeMagnets = useRef<WeakSet<Element>>(new WeakSet());
  // Latest pointer position; the rAF tick reads from here so mousemove
  // never does layout work directly.
  const pointer = useRef({ x: 0, y: 0 });
  const rafScheduled = useRef(false);

  const tick = () => {
    rafScheduled.current = false;
    const { x, y } = pointer.current;

    gsap.to(cursor.current, { x, y, duration: 0.1, ease: Linear.easeNone, overwrite: true });
    gsap.to(follower.current, { x, y, duration: 0.3, ease: Linear.easeNone, overwrite: true });
    gsap.to(glow.current, { x, y, duration: 0.6, ease: "power2.out", overwrite: true });

    const magnetTargets = document.querySelectorAll("[data-magnetic]");
    magnetTargets.forEach((el) => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      // Skip Math.hypot's sqrt by comparing squared distance against 80^2.
      const distSq = dx * dx + dy * dy;

      if (distSq < 6400) {
        gsap.to(el, { x: dx * 0.15, y: dy * 0.15, duration: 0.3, ease: "power2.out", overwrite: true });
        activeMagnets.current.add(el);
      } else if (activeMagnets.current.has(el)) {
        // Only emit the reset tween once, when the pointer first leaves
        // the magnetic radius. Avoids a fresh Tween every frame.
        gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: "power2.out", overwrite: true });
        activeMagnets.current.delete(el);
      }
    });
  };

  const moveCircle = (e: MouseEvent) => {
    pointer.current.x = e.clientX;
    pointer.current.y = e.clientY;
    if (!rafScheduled.current) {
      rafScheduled.current = true;
      requestAnimationFrame(tick);
    }
  };

  const initCursorAnimation = useCallback(() => {
    if (!follower.current || !cursor.current || !glow.current) return;
    follower.current.classList.remove("hidden");
    cursor.current.classList.remove("hidden");
    glow.current.classList.remove("hidden");

    // Passive listener so the browser doesn't have to wait for us before
    // scrolling — and we never call preventDefault here anyway.
    document.addEventListener("mousemove", moveCircle, { passive: true });

    const hoverEls: Element[] = [];
    document.querySelectorAll(".link, [data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", onHover);
      el.addEventListener("mouseleave", onUnhover);
      hoverEls.push(el);
    });

    return () => {
      document.removeEventListener("mousemove", moveCircle);
      hoverEls.forEach((el) => {
        el.removeEventListener("mouseenter", onHover);
        el.removeEventListener("mouseleave", onUnhover);
      });
    };
  }, []);

  useEffect(() => {
    if (isDesktop && !isSmallScreen()) {
      return initCursorAnimation();
    }
  }, [cursor, follower, isDesktop, initCursorAnimation]);

  return (
    <>
      <div
        ref={cursor}
        className={`${styles.cursor} ${CURSOR_STYLES.CURSOR}`}
      ></div>
      <div
        ref={follower}
        className={`${styles.cursorFollower} ${CURSOR_STYLES.FOLLOWER}`}
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <span
          ref={followerLabel}
          className="text-white text-xs font-medium pointer-events-none"
          style={{ opacity: 0 }}
        />
      </div>
      <div
        ref={glow}
        className={CURSOR_STYLES.GLOW}
        style={{
          width: 400,
          height: 400,
          marginLeft: -200,
          marginTop: -200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(145, 70, 255, 0.045) 0%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      ></div>
    </>
  );
};

export default Cursor;
