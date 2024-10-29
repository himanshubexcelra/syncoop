"use client";

import { DropDownItem, UserData } from '@/lib/definition';
import { PopupBox } from '@/ui/popupBox';
import { clearSession } from '@/utils/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { deleteMoleculeCart } from '../Libraries/libraryService';
import CartDetails from '../Libraries/CartDetails';
import { Popup as CartPopup, } from "devextreme-react/popup";
import { useContext } from "react";
import { AppContext } from "../../app/AppState";
import { getMoleculeCart } from '../Libraries/libraryService';


type HeaderProps = {
    userData: UserData
}

export default function Header({ userData }: HeaderProps) {
    const context: any = useContext(AppContext);
    const searchParams = useSearchParams();
    const libraryId = searchParams.get('libraryId')?searchParams.get('libraryId'):0;
    const cartDetail = useMemo(() => context.state.cartDetail || [], [context.state.cartDetail]);
    const [shortName, setShortName] = useState<string>('');
    const [dropDownItems, setDropdownItems] = useState<DropDownItem[]>([]);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [cartData, setCartData] = useState([])
    interface deleteObj {
        id: number;
        libraryId: number;
        moleculeId: number;
    }
    
    useEffect(() => {
        const fetchCartData = async () => {
            const cartDataAvaialable: any = await getMoleculeCart(Number(libraryId), false);
            setCartData(cartDataAvaialable);
        };

        fetchCartData();
    }, [libraryId, cartDetail]);

    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const removeItemFromCart = (obj:deleteObj) => {
        const { id, moleculeId, libraryId } = obj;
        deleteMoleculeCart(id).then((res)=>{
            if(res){
            const filteredData = cartData.filter((item: any) => 
                !(item.moleculeId === moleculeId && item.libraryId === libraryId)
            );
            setCartData(filteredData);
            }
        })
        .catch((error)=>{
            console.log(error);
        })

        
    }
    
    const removeAll = () => {
        console.log('Remove All');

        
    }
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
            <CartPopup
                title="Molecule Cart"
                visible={createPopupVisible}
                onHiding={() => setCreatePopupVisibility(false)}

                contentRender={() => (
                    <CartDetails
                        cartData={cartData}
                        removeItemFromCart={(obj:deleteObj)=>removeItemFromCart(obj)}
                        removeAll={removeAll}
                    />
                )}
                width={470}
                // hideOnOutsideClick={true}
                height="100%"
                position={popupPosition}

                showCloseButton={true}
                wrapperAttr={{ class: "create-popup mr-[15px]" }}
            />
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
                <Link href="#">
                    <div className="relative flex items-center justify-center">
                        <Image priority
                            className="icon-cart"
                            src={"/icons/cart-icon.svg"}
                            alt="Cart"
                            width={33}
                            height={22}
                        />
                        <div className="absolute flex items-center justify-center w-5 h-5 rounded-full bg-themeYellowColor right-0">
                            <span className="text-black text-sm" onClick={() => setCreatePopupVisibility(!createPopupVisible)}>{cartData.length}</span>
                        </div>
                    </div>
                </Link>
                <div>
                    <div className="flex items-center justify-center w-[24px] h-[24px] text-white rounded-full border-2 border-white cursor-pointer" onClick={toggleDropdown}>{shortName}</div>
                    <PopupBox
                        isOpen={dropdownOpen}
                        onItemSelected={(item: DropDownItem) => onItemSelected(item)}
                        onClose={toggleDropdown}
                        items={dropDownItems} />
                </div>
            </div>
        </header>);
}