"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "./components/nav";
import Footer from "./components/footer";
import Cursor from "./components/cursor";
import { DataContextProvider } from "./context/DataContext";
import { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { ColorSchemeScript } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({ children }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        staleTime: 480_000,
                    },
                },
            })
    );
    return (
        <html lang="en">
            <head>

                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>projectX</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
                    rel="stylesheet" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
                <link rel="icon" type="image/x-icon" href="./favicon.png" />
            </head>
            <body className={inter.className}>
                <Cursor />
                <MantineProvider withCssVariables>
                    <ColorSchemeScript defaultColorScheme="light" />
                    <QueryClientProvider client={queryClient}>
                        <ModalsProvider>
                            <DataContextProvider>
                                <Nav />
                                <Notifications
                                    autoClose={3000}
                                    position="top-right"
                                    limit={1}
                                />
                                {children}
                                <Footer />
                            </DataContextProvider>
                        </ModalsProvider>
                    </QueryClientProvider>
                </MantineProvider>
            </body>
        </html>
    );
}
