"use client";

import { DropDownItem, UserData } from '@/lib/definition';
import { PopupBox } from '@/ui/popupBox';
import { clearSession } from '@/utils/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '../../app/Provider/CartProvider';

type HeaderProps = {
    userData: UserData
}

export default function Header({ userData }: HeaderProps) {
    const { cart } = useCart();
    console.log(cart, "CARTCART")
    const cartLength = (cart && cart.length > 0) ? cart.length : (localStorage.getItem('cart')) ? JSON.parse(localStorage.getItem('cart') ?? '[]').length : 0;
    const [shortName, setShortName] = useState<string>('');
    const [dropDownItems, setDropdownItems] = useState<DropDownItem[]>([]);

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
        if (userData) {
            if (userData.firstName)
                setShortName(userData.firstName.charAt(0));

            setDropdownItems([
                {
                    label: userData?.email,
                    value: 'email',
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

    return (
        <header className="top-0 left-0 w-full h-10 bg-themeBlueColor flex items-center justify-between px-4 shadow-sm">
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
                <Image
                    className="icon-help"
                    src={"/icons/help-icon.svg"}
                    alt="Help"
                    width={20}
                    height={20}
                />
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
                <Link href="/cart">
                    <div className="relative flex items-center justify-center">
                        <Image priority
                            className="icon-cart"
                            src={"/icons/cart-icon.svg"}
                            alt="Cart"
                            width={33}
                            height={22} />
                        <div className="absolute flex items-center justify-center w-5 h-5 rounded-full bg-themeYellowColor right-0">
                            <span className="text-black text-sm">{cartLength}</span>
                        </div>
                    </div>
                </Link>
                <div>
                    <div className="flex items-center justify-center w-[24px] h-[24px] text-white rounded-full border-2 border-white cursor-pointer" onClick={toggleDropdown}>{shortName}</div>
                    <PopupBox
                        isOpen={dropdownOpen}
                        onItemSelected={(item: DropDownItem) => onItemSelected(item)}
                        items={dropDownItems} />
                </div>
            </div>
        </header>);
}