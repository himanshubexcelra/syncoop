/*eslint max-len: ["error", { "code": 100 }]*/
"use client";

import { DeleteMoleculeCart, DropDownItem, UserData } from '@/lib/definition';
import { PopupBox } from '@/ui/popupBox';
import { clearSession } from '@/utils/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Popup as CartPopup } from "devextreme-react/popup";
import { Popup as OrderPopup } from "devextreme-react/popup";
import { useContext } from "react";
import { AppContext } from "../../app/AppState";
import { Messages } from "@/utils/message";
import toast from "react-hot-toast";
import { deleteMoleculeCart, getMoleculeCart } from '../Libraries/libraryService';
import CartDetails from '../Libraries/CartDetails';
import OrderDetails from '../Libraries/OrderDetails'

type HeaderProps = {
    userData: UserData,
    actionsEnabled: string[]
}

export default function Header({ userData }: HeaderProps) {
    const context: any = useContext(AppContext);
    const appContext = context.state;
    const searchParams = useSearchParams();
    const library_id = searchParams.get('library_id') ? searchParams.get('library_id') : 0;
    const cartDetail = useMemo(() => context.state.cartDetail || [], [context.state.cartDetail]);
    const [shortName, setShortName] = useState<string>('');
    const [dropDownItems, setDropdownItems] = useState<DropDownItem[]>([]);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const [orderPopupPosition, setOrderPopupPosition] = useState({} as any);
    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [orderPopupVisible, setOrderPopupVisibility] = useState(false);
    const [cartData, setCartData] = useState([]);

    useEffect(() => {
        const fetchCartData = async () => {
            const cartDataAvaialable: any = await getMoleculeCart(Number(userData.id));
            setCartData(cartDataAvaialable);
        };

        fetchCartData();
    }, [library_id, cartDetail, userData.id]);

    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const removeItemFromCart = (obj: DeleteMoleculeCart) => {
        const { molecule_id, library_id, project_id, moleculeName, created_by } = obj;
        deleteMoleculeCart(created_by, molecule_id, library_id, project_id).then((res) => {
            if (res) {
                const filteredData = cartData.filter((item: any) =>
                    !
                    (
                        item.molecule_id === molecule_id &&
                        item.library_id === library_id &&
                        item.project_id === project_id
                    )
                );
                context?.addToState({
                    ...appContext, cartDetail: [...filteredData]
                })
                const message = Messages.deleteMoleculeMessage(moleculeName);
                toast.success(message);
                setCartData(filteredData);
                if (filteredData.length == 0) {
                    setCreatePopupVisibility(false);
                }
            }
        })
            .catch((error) => {
                console.log(error);
            })


    }

    const removeAll = (user_id: number, type: string) => {
        deleteMoleculeCart(user_id).then((res) => {
            if (res) {
                setCartData([]);
                context?.addToState({
                    ...appContext, cartDetail: []
                })
                if (type === 'RemoveAll') {
                    setCreatePopupVisibility(false)
                    toast.success(Messages.REMOVE_ALL_MESSAGE);
                }
                else {
                    setCreatePopupVisibility(false)
                    setOrderPopupVisibility(true)
                }

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

    const closeOrderPopup = () => {
        setOrderPopupVisibility(false);
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
        if (typeof window !== 'undefined') {
            setOrderPopupPosition({
                my: 'center',
                at: 'center',
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

    return (
        <header className="top-0 left-0 w-full h-10 bg-themeBlueColor 
            flex items-center justify-between px-4 shadow-sm">
            {createPopupVisible && <CartPopup
                title="Molecule Cart"
                visible={createPopupVisible}
                onHiding={() => setCreatePopupVisibility(false)}

                contentRender={() => (
                    <CartDetails
                        cartData={cartData}
                        user_id={userData.id}
                        orgType={userData.orgUser.type}
                        removeItemFromCart={(obj: DeleteMoleculeCart) => removeItemFromCart(obj)}
                        removeAll={(user_id: number, type: string) => removeAll(user_id, type)}
                    />
                )}
                width={570}
                // hideOnOutsideClick={true}
                height="100vh"
                position={popupPosition}

                showCloseButton={true}
                wrapperAttr={{ class: "create-popup" }}
            />}
            {orderPopupVisible && <OrderPopup
                visible={orderPopupVisible}
                onHiding={() => setOrderPopupVisibility(false)}
                contentRender={() => (
                    <OrderDetails
                        closeOrderPopup={closeOrderPopup}
                    />
                )}
                width={577}
                // hideOnOutsideClick={true}
                height={236}
                position={orderPopupPosition}
                showCloseButton={false}
                wrapperAttr={{ class: "order-popup" }}
                style={{ backgroundColor: 'white' }}
            />}
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
        </header>);
}