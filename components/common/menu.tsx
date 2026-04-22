// Copyright Ayush Singh 2021,2022. All Rights Reserved.
// Project: folio
// Author contact: https://www.linkedin.com/in/alphaayush/
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { Dispatch, SetStateAction } from "react";
import { NAVBARITEMS } from "../../constants";
import Link from "next/link";
import { trackEvent } from "../../utils/clarity";

const Menu = ({
	setmenuVisible,
}: {
	setmenuVisible: Dispatch<SetStateAction<boolean>>;
}) => {
	return (
		<section
			className="menu fixed top-0 left-0 w-full h-full overflow-hidden invisible pointer-events-none flex items-center justify-center"
			style={{ visibility: "hidden" }}
		>
			<div className="flex-none overflow-hidden flex items-center justify-center">
				<div className="text-center opacity-0 overflow-y-auto flex flex-none justify-center items-center max-h-screen">
					<ul
						className="list-none py-4 px-0 m-0 block max-h-screen"
						role="menu"
					>
						{NAVBARITEMS.map((el) => (
							<li
								className="p-0 m-6 text-2xl block"
								key={el.name}
								role="menuitem"
							>
								<a
									className="link relative inline font-bold text-5xl duration-[10ms] hover:no-underline text-white"
									href={el.ref.startsWith('http') ? el.ref : (el.ref.startsWith('/') ? el.ref : `/#${el.ref}`)}
									onClick={() => {
										trackEvent("nav_link_click", { target: el.name, location: "mobile_menu" });
										setmenuVisible(false);
									}}
									{...(el.ref.startsWith('http') && { target: "_blank", rel: "noreferrer" })}
								>
									{el.name}
								</a>
							</li>
						))}

					</ul>
				</div>
			</div>
		</section>
	);
};

export default Menu;
