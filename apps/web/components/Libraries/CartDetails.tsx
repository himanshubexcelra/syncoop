
import DataGrid, { Column } from 'devextreme-react/data-grid';
import styles from "./table.module.css";
import { Button as Btn } from "devextreme-react/button";
import Image from "next/image";

export default function CartDetails() {
    const removeItemFromCart = () => {
        
    }
    const cartDetails = typeof localStorage !== 'undefined' && localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart') ?? '[]') : [];
    const cartProjectData: [] = cartDetails.reduce((acc, item) => {
        const project = acc.find(p => p.projectName === item.projectName);
        if (project) {
            project.items.push(item);
        } else {
            acc.push({ projectName: item.projectName, items: [item] });
        }
        return acc;
    }, []);
    return (
        <>
            {
                cartProjectData.length > 0 && cartProjectData.map((project) => (
                    <>
                        <div className='accordion-title'>{project.projectName}</div>
                        <DataGrid
                            dataSource={project.items}
                            showBorders={true}
                            elementAttr={{ cssClass: styles.table }}
                            className="no-padding-header"
                        >
                            <Column dataField="id" caption="ID" />
                            <Column dataField="moleculeId" caption="Molecule ID" />
                            <Column dataField="molecularWeight" caption="Molecular Weight" />
                            <Column
                                width={80}
                                cellRender={({ data }: any) => (
                                    <Btn
                                        render={() => (
                                            <>
                                                <Image
                                                    src="/icons/delete.svg"
                                                    width={24}
                                                    height={24}
                                                    alt="Create"
                                                />
                                            </>
                                        )}
                                       onClick={() => removeItemFromCart(data)}
                                    />
                                )}
                                caption="Remove"
                            />

                        </DataGrid>
                    </>
                ))}
        </>
    );
}