// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import Image from "next/image";
import { useState } from "react";
import Menu from "@/components/common/menu2";
import { NAVBARITEMS } from "../../constants";
import Link from "next/link";

const Header = () => {
	const [menuVisible, setmenuVisible] = useState(false);

	return (
		<header className="w-full fixed top-0 py-8 select-none z-50 bg-gradient-to-b from-gray-900 to-transparent">
			<div className="flex justify-between section-container">
				<Link href="/#home">
					<a className="link">
						<Image src="/logo.svg" alt="Logo" width={22} height={22} />
					</a>
				</Link>
				<div className="hidden md:flex items-center justify-center">
					{NAVBARITEMS.map((item: any) => (
						item.ref.startsWith('http') ? (
							<a
								key={item.name}
								href={item.ref}
								className="link px-3"
								target="_blank"
								rel="noreferrer"
							>
								{item.name}
							</a>
						) : (
							<Link href={item.ref.startsWith('/') ? item.ref : `/#${item.ref}`} key={item.name}>
								<a className="link px-3">{item.name}</a>
							</Link>
						)
					))}
				</div>
				<nav className={`outer-menu md:hidden ${menuVisible ? "menu-visible" : ""}`}>
					<button
						className="hamburger w-6 h-6 flex items-center justify-center link relative"
						aria-label={menuVisible ? "Close menu" : "Open menu"}
						aria-expanded={menuVisible}
						onClick={setmenuVisible.bind(null, !menuVisible)}
					>
						<div className="relative flex-none w-full bg-white duration-[10ms] flex items-center justify-center"></div>
					</button>
					<Menu setmenuVisible={setmenuVisible} />
				</nav>
				<div className="hidden md:block w-[22px]" />
			</div>
		</header>
	);
};

export default Header;
