/*eslint max-len: ["error", { "code": 100 }]*/
"use client";

import {
    DropDownItem,
    UserData,
} from '@/lib/definition';
import { usePathname } from 'next/navigation'
import { PopupBox } from '@/ui/popupBox';
import { clearSession } from '@/utils/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useContext } from "react";
import { AppContext } from "../../app/AppState";
import { getMoleculeCart } from '../Libraries/service';
import CartPopupComponent from './CartPopupComponent';
import OrderPopupComponent from './OrderPopupComponent';
import {
    isProtocolAproover,
    isSystemAdmin,
} from '@/utils/helpers';

type HeaderProps = {
    userData: UserData,
    actionsEnabled: string[]
}

export default function Header({ userData }: HeaderProps) {
    const context: any = useContext(AppContext);
    const searchParams = useSearchParams();
    const library_id = searchParams.get('library_id') ? searchParams.get('library_id') : 0;
    const cartDetail = useMemo(() => context.state.cartDetail || [], [context.state.cartDetail]);
    const [shortName, setShortName] = useState<string>('');
    const [dropDownItems, setDropdownItems] = useState<DropDownItem[]>([]);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [orderPopupVisible, setOrderPopupVisibility] = useState(false);
    const [orderMsg, setOrderMsg] = useState<string>('');
    const [cartCount, setCartCount] = useState<number>(0);
    const currentUrl = usePathname();
    const containsProjects = currentUrl.includes("/projects");
    const containsMoleculeOrder = currentUrl.includes("/molecule_order");
    const { myRoles } = userData;

    useEffect(() => {

        const getTotalMolecules = async () => {
            if (userData.id) {
                let params: object = {
                    user_id: userData.id,
                    source: 'header'
                }
                if (containsMoleculeOrder &&
                    (isSystemAdmin(myRoles) || isProtocolAproover(myRoles))) {
                    params = {
                        ...params,
                        lab_job_cart: true,
                    }
                }
                const moleculeCount: number = await getMoleculeCart(params);
                setCartCount(moleculeCount);
            }
        }
        getTotalMolecules();
    }, [library_id, cartDetail, userData.id])

    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const onItemSelected = async (item: DropDownItem) => {
        if (item.link) {
            router.push(item.link);
        }

        if (item.value === 'Logout') {
            await clearSession();
        }
        setDropdownOpen(false)
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPopupPosition({
                my: 'top right',
                at: 'top right',
                of: window,
            });
        }
    }, []);

    useEffect(() => {
        if (userData) {
            if (userData.first_name)
                setShortName(userData.first_name.charAt(0));

            setDropdownItems([
                {
                    label: userData?.email_id,
                    value: 'email_id',
                },
                {
                    label: 'Profile',
                    value: 'Profile',
                    link: '/profile'
                },
                {
                    label: 'Logout',
                    value: 'Logout',
                }
            ]);
        }
    }, [userData])
    const setOrderData = (msg: string, visible: boolean) => {
        setOrderMsg(msg)
        setOrderPopupVisibility(visible)
    }
    return (
        <>
            <header className="top-0 left-0 w-full h-10 bg-themeBlueColor 
            flex items-center justify-between px-6 shadow-sm">
                <div className="flex items-center">
                    <Link href="/">
                        <Image
                            src={"/icons/aidd-icon-shell.svg"}
                            alt="aidd icon"
                            width={267}
                            height={24}
                        />
                    </Link>
                </div>
                <div className="flex items-center gap-8">
                    <a href="/data/Example_help_documentation.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center">
                        <Image
                            className="icon-help"
                            src="/icons/help-icon.svg"
                            alt="Help"
                            width={20}
                            height={20}
                        />
                    </a>
                    <Image
                        className="icon-bell"
                        src={"/icons/bell-icon.svg"}
                        alt="Bell"
                        width={20}
                        height={20}
                    />
                    <Image
                        className="icon-preferences"
                        src={"/icons/preferences-icon.svg"}
                        alt="Preferences"
                        width={20}
                        height={20}
                    />
                    <Link href="#"
                        onClick={() => setCreatePopupVisibility(cartCount > 0)}
                    >
                        <div className="relative flex items-center justify-center">
                            <Image priority
                                className="icon-cart"
                                src={"/icons/cart-icon.svg"}
                                alt="Cart"
                                width={33}
                                height={22}
                            />
                            <div className="absolute flex items-center 
                            justify-center w-5 h-5 rounded-full bg-themeYellowColor right-0"
                            >
                                <span
                                    className="text-black text-sm"
                                    onClick={() =>
                                        setCreatePopupVisibility(
                                            cartCount > 0 ?
                                                !createPopupVisible : createPopupVisible
                                        )
                                    }
                                >
                                    {cartCount}
                                </span>

                            </div>
                        </div>
                    </Link>
                    <div>
                        <div
                            className="flex items-center justify-center w-[24px] h-[24px] 
    text-white rounded-full border-2 border-white cursor-pointer"
                            onClick={toggleDropdown}
                        >
                            {shortName}
                        </div>
                        <PopupBox
                            isOpen={dropdownOpen}
                            onItemSelected={(item: DropDownItem) => onItemSelected(item)}
                            onClose={toggleDropdown}
                            items={dropDownItems} />
                    </div>
                </div>
            </header> {createPopupVisible && <CartPopupComponent
                createPopupVisible={createPopupVisible}
                setCreatePopupVisibility={setCreatePopupVisibility}
                userData={userData}
                library_id={Number(library_id)}
                containsProjects={containsProjects}
                setOrderData={(msg: string, visible: boolean) => setOrderData(msg, visible)}
                containsMoleculeOrder={containsMoleculeOrder}
                popupPosition={popupPosition}
            />}
            {orderPopupVisible && <OrderPopupComponent
                orderPopupVisible={orderPopupVisible}
                setOrderPopupVisibility={setOrderPopupVisibility}
                orderMsg={orderMsg}
                closeOrderPopup={() => setOrderPopupVisibility(false)}
            />}</>);
}