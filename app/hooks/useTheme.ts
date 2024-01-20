import { create } from "zustand";

interface ChangeThemeColor {
    isDarkTheme:boolean;
    changeDark: () => void;
    changeLight: () => void;
}

const changeTheme = create<ChangeThemeColor>((set) => ({
    isDarkTheme: true,
    changeDark: () => set({ isDarkTheme: true }),
    changeLight: () => set({ isDarkTheme: false })
}))

export default changeTheme