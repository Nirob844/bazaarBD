// components/Providers.tsx
"use client";

import theme from "@/lib/theme";
import { store } from "@/redux/store";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <CssBaseline />
        {children}
      </Provider>
    </ThemeProvider>
  );
}
