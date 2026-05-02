// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { SOCIAL_LINKS } from "../../constants";
import Image from "next/image";
import Button, { ButtonTypes } from "./button";
import { trackEvent, setTag } from "../../utils/clarity";

const Footer = () => {
	const renderSocialIcons = (): React.ReactNode => {
		return (Object.keys(SOCIAL_LINKS) as Array<keyof typeof SOCIAL_LINKS>).map((el) => (
			<a
				href={SOCIAL_LINKS[el]}
				key={el}
				className="link hover:opacity-90 hover:scale-110 transition-all duration-[10ms] md:px-2 px-1"
				rel="noreferrer"
				target="_blank"
				onClick={() => { trackEvent("footer_social_click"); setTag("social_platform", el); }}
			>
				<Image src={`/social/${el}.svg`} alt={el} width={40} height={40} />
			</a>
		));
	};

	const renderFooterContent = (): React.ReactNode => (
		<>
			<h2 className="font-medium text-3xl md:text-4xl text-center">
				Connect with me on social media.
			</h2>

			<div className="flex mt-6 gap-3">
				{renderSocialIcons()}
			</div>

			<div className="flex mt-6">
				<Button
					type={ButtonTypes.WHITE}
					name="Let's Talk"
					href="https://www.linkedin.com/in/minhbphamm/"
					onClick={() => trackEvent("footer_lets_talk")}
					otherProps={{
						target: "_blank",
						rel: "noreferrer",
					}}
				></Button>
			</div>
			<p className="text-center text-xs text-white/60 mt-14">
				Designed by Ayush
			</p>
		</>
	);

	return (
		<footer
			className="w-full relative select-none bg-cover flex flex-col items-stretch"
			id="footer"
		>
			<img
				src="/footer-curve.svg"
				alt="Footer"
				className="w-full"
				loading="lazy"
				height={290}
				role="presentation"
				width={1440}
			/>
			<div className="h-full w-full">
				<div className="section-container flex-col flex h-full justify-end z-10 items-center py-8 md:py-12">
					{renderFooterContent()}
				</div>
			</div>
		</footer>
	);
};

export default Footer;
