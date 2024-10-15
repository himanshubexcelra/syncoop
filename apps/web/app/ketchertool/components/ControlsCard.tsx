import { ReactNode } from "react";
interface ControlsCardProps {
  cardName: string;
  children: ReactNode;
}

export const ControlsCard = ({ cardName, children }: ControlsCardProps) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', width: '255px' }}>
      <div style={{ fontWeight: 'bold', marginTop: '20px', color: 'rgb(0,0,0,0.6)' }}>{cardName}</div>
      {children}
    </div>
  );
};
