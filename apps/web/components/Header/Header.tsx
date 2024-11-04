/*eslint max-len: ["error", { "code": 100 }]*/
"use client";

import { CartItem, DeleteMoleculeCart, DropDownItem, UserData } from '@/lib/definition';

import { PopupBox } from '@/ui/popupBox';
import { clearSession } from '@/utils/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Popup as CartPopup, } from "devextreme-react/popup";
import { useContext } from "react";
import { AppContext } from "../../app/AppState";
import { Messages } from "@/utils/message";
import toast from "react-hot-toast";
import CartDetails from '../Libraries/CartDetails';
import { deleteMoleculeCart, getMoleculeCart } from '../Libraries/libraryService';


type HeaderProps = {
    userData: UserData,
    actionsEnabled: string[]
}

export default function Header({ userData, actionsEnabled }: HeaderProps) {
    const createEnabled = actionsEnabled.includes('create_molecule_order');
    const context: any = useContext(AppContext);
    const searchParams = useSearchParams();
    const libraryId = searchParams.get('libraryId') ? searchParams.get('libraryId') : 0;
    const cartDetail = useMemo(() => context.state.cartDetail || [], [context.state.cartDetail]);
    const [shortName, setShortName] = useState<string>('');
    const [dropDownItems, setDropdownItems] = useState<DropDownItem[]>([]);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [cartData, setCartData] = useState([]);

    useEffect(() => {
        const fetchCartData = async () => {
            const cartDataAvaialable: any = await getMoleculeCart(Number(userData.id));
            setCartData(cartDataAvaialable);
        };

        fetchCartData();
    }, [libraryId, cartDetail, userData.id]);

    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const removeItemFromCart = (obj: DeleteMoleculeCart) => {

        const { moleculeId, libraryId, projectId, moleculeName } = obj;
        deleteMoleculeCart(moleculeId, libraryId, projectId).then((res) => {
            if (res) {
                const filteredData = cartData.filter((item: any) =>
                    !
                    (
                        item.moleculeId === moleculeId &&
                        item.libraryId === libraryId &&
                        item.projectId === projectId
                    )
                );
                const message = Messages.deleteMoleculeMessage(moleculeName);
                toast.success(message);

                setCartData(filteredData);
            }
        })
            .catch((error) => {
                console.log(error);
            })


    }

    const removeAll = () => {
        deleteMoleculeCart().then((res) => {
            if (res) {
                setCartData([]);
                toast.success(Messages.REMOVE_ALL_MESSAGE);

            }
        })
            .catch((error) => {
                console.log(error);
            })
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
        <header className="top-0 left-0 w-full h-10 bg-themeBlueColor 
            flex items-center justify-between px-4 shadow-sm">
            <CartPopup
                title="Molecule Cart"
                visible={createPopupVisible}
                onHiding={() => setCreatePopupVisibility(false)}

                contentRender={() => (
                    <CartDetails
                        cartData={cartData}
                        removeItemFromCart={(obj: DeleteMoleculeCart) => removeItemFromCart(obj)}
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
                {
                    createEnabled &&
                    <Link href="#"
                        onClick={() =>
                            setCreatePopupVisibility(
                                cartData.length > 0 ? !createPopupVisible : createPopupVisible
                            )
                        }

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
                                            cartData.length > 0 ?
                                                !createPopupVisible : createPopupVisible
                                        )
                                    }
                                >
                                    {cartData.length}
                                </span>

                            </div>
                        </div>
                    </Link>
                }
                <div>
                    <div
                        className="flex items-center justify-center w-[24px] h-[24px] 
    text-white rounded-full border-2 border-white cursor-pointer"
                        onClick={toggleDropdown}
                    >
                        {shortName}
                    </div>                    <PopupBox
                        isOpen={dropdownOpen}
                        onItemSelected={(item: DropDownItem) => onItemSelected(item)}
                        onClose={toggleDropdown}
                        items={dropDownItems} />
                </div>
            </div>
        </header>);
}