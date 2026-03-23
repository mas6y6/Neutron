import React, {JSX, useImperativeHandle, useState} from "react";
import {Button} from "./UI";
import {AdminIcon, ArrowLeft, People, Settings} from "./Icons";
import {modalContainerRef} from "./App";
import {SettingsModal} from "./modals/settings";

export interface ZariumProps {
    superadmin?: boolean;
}

export interface ZariumHandle {
    show: () => void;
    hide: () => void;
    getSidebarContent: () => SidebarHandle | null;
    getMainContent: () => MainContentHandle | null;
}

export const Zarium = React.forwardRef<ZariumHandle, ZariumProps>((props, ref) => {
    const [visible, setVisible] = React.useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarContentRef = React.createRef<SidebarHandle>();
    const mainContentRef = React.createRef<MainContentHandle>();

    useImperativeHandle(ref, () => ({
        show: () => setVisible(true),
        hide: () => setVisible(false),
        getSidebarContent: () => sidebarContentRef.current,
        getMainContent: () => mainContentRef.current
    }));

    return (
        <div className={`Zarium ${visible ? 'show' : ''}`}>
            <Topbar className={sidebarOpen ? 'sidebar-open' : ''}>
                <Button
                    className={`TopbarToggle ${sidebarOpen ? 'open' : ''}`}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    color="transparent"
                >
                    <ArrowLeft/>
                </Button>
                <Button color="secondary">
                    <People/>
                </Button>
                <Button color="secondary" onClick={() => modalContainerRef.current?.set(<SettingsModal/>)}>
                    <Settings/>
                </Button>
                {props.superadmin && (
                    <Button color="primary">
                        <AdminIcon/>
                    </Button>
                )}
            </Topbar>
            <div className="ZariumInner">
                <Sidebar className={sidebarOpen ? 'open' : ''} ref={sidebarContentRef}/>
                <MainContent
                    className={sidebarOpen ? 'overlay-active' : ''}
                    onClick={() => setSidebarOpen(false)}
                    ref={mainContentRef}
                />
            </div>
        </div>
    );
});

export interface SidebarProps {
    className?: string;
}

export interface SidebarHandle {
    setAccountbar: (accountbar: JSX.Element) => void;
    setGroups: (groups: JSX.Element) => void;
    getAccountbar: () => JSX.Element | null;
    getGroups: () => JSX.Element | null;
}

export const Sidebar = React.forwardRef<SidebarHandle, SidebarProps>((props, ref) => {
    const [accountbar,setAccountbar] = useState<JSX.Element | null>(null);
    const [groups,setGroups] = useState<JSX.Element | null>(null);

    useImperativeHandle(ref, () => ({
        setAccountbar: (newAccountbar: JSX.Element) => setAccountbar(newAccountbar),
        setGroups: (newGroups: JSX.Element) => setGroups(newGroups),
        getAccountbar: () => accountbar,
        getGroups: () => groups
    }));

    return (
        <div className={`Sidebar ${props.className ?? ''}`}>
            {groups}
            {accountbar}
        </div>
    )
});

export interface MainContentHandle {
    openTab: (name: string, content: JSX.Element) => string;
    closeTab: (id: number | string) => void;
}

export interface MainContentProps {
    className?: string;
    onClick?: () => void;
}

export const MainContent = React.forwardRef<MainContentHandle, MainContentProps>((props, ref) => {
    const [tabs, setTabs] = React.useState<{id: string, name: string, content: JSX.Element}[]>([]);
    const [activeTab, setActiveTab] = React.useState<number>(-1);

    const closeTab = (id: number | string) => {
        setTabs(prev => {
            let index = -1;
            if (typeof id === 'number') {
                index = id;
            } else {
                index = prev.findIndex(t => t.id === id);
            }

            if (index === -1 || index >= prev.length) return prev;

            const newTabs = prev.filter((_, i) => i !== index);
            if (activeTab === index) {
                setActiveTab(newTabs.length > 0 ? Math.max(0, index - 1) : -1);
            } else if (activeTab > index) {
                setActiveTab(activeTab - 1);
            }
            return newTabs;
        });
    };

    useImperativeHandle(ref, () => ({
        openTab: (name: string, content: JSX.Element) => {
            const id = crypto.randomUUID();
            setTabs(prev => {
                const existingIndex = prev.findIndex(t => t.name === name);
                if (existingIndex !== -1) {
                    const newTabs = [...prev];
                    newTabs[existingIndex] = {id: newTabs[existingIndex].id, name, content};
                    setActiveTab(existingIndex);
                    return newTabs;
                }
                const newTabs = [...prev, {id, name, content}];
                setActiveTab(newTabs.length - 1);
                return newTabs;
            });
            return id;
        },
        closeTab: (id: number | string) => closeTab(id)
    }))

    return (
        <div className={`MainContent ${props.className ?? ''}`} onClick={props.onClick}>
            {tabs.length > 0 && (
                <div className="MainContentTabs">
                    <div
                        className={`MainContentTab ${activeTab === -1 ? 'active' : ''}`}
                        onClick={() => setActiveTab(-1)}
                    >
                        Main
                    </div>
                    {tabs.map((tab, index) => (
                        <div
                            key={tab.id}
                            className={`MainContentTab ${activeTab === index ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab(index);
                            }}
                        >
                            {tab.name}
                            <span className="MainContentTabClose" onClick={(e) => {
                                e.stopPropagation();
                                closeTab(index);
                            }}>×</span>
                        </div>
                    ))}
                </div>
            )}
            <div className="MainContentBody">
                { activeTab === -1 ? <ZariumDefaultMainContent /> : tabs[activeTab].content }
            </div>
        </div>
    )
});

export interface TopbarProps {
    className?: string;
}

export function Topbar(props: React.PropsWithChildren<TopbarProps>) { return <div className={`Topbar ${props.className ?? ''}`}>{props.children}</div> }

export interface AccountbarProps {
    username: string;
    displayname: string;
    id?: string;
}

export function Accountbar(props: AccountbarProps) {
    const profile = `/api/get-avatar?id=${props.id}`;

    return (
        <div className="Accountbar">
            <div className="AccountbarAvatar">
                <img src={profile} alt="Avatar" />
            </div>
            <div className="AccountbarInfo">
                <div className="AccountbarName">{props.displayname}</div>
                <div className="AccountbarStatus">@{props.username}</div>
            </div>
        </div>
    )
}

export function Groups() {
    return (
        <div className="Groups"></div>
    )
}

export function ZariumDefaultMainContent() {
    return (
        <>
            <h1>Welcome to Zarium</h1>
            <p>lol</p>
        </>
    )
}