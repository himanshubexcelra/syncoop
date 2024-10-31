"use client";
import React, {
  FC,
  createContext,
  useState,
  ReactNode
} from 'react';
import { AppContextModel } from '@/lib/definition';

interface AppState {
  appContext: AppContextModel,
}

const initialContext = {
  userCount: {
    externalUsers: 0,
    internalUsers: 0
  },
  refreshAssayTable: false,
  refreshUsersTable: false,
}

interface AppContextData {
  state: AppState;
  addToState?: (data: AppState) => void;
}

const initialUniverseData: AppContextData = {
  state: { appContext: initialContext }
}

export const AppContext = createContext<AppContextData>(initialUniverseData);

export const AppContextProvider: FC<{ children: ReactNode }> =
  ({ children }) => {
    const [state, setState] = useState<AppState>
      ({ appContext: initialContext });

    const addToState = (obj: AppState) => {
       setState(() => obj);
    };
    return (
      <AppContext.Provider value={{ state, addToState }}>
        {children}
      </AppContext.Provider>
    );
  };