import React, {ReactNode} from "react";
import { forwardRef, useImperativeHandle, useState, JSX } from "react";

import "./css/Modals.css";

export interface ModalContainerHandle {
    set: (modal: JSX.Element) => void;
    close: () => void;
}

export interface ModalHandle {
    showModal: () => void;
    hideModal: () => void;
}

interface ModalProps {
    children?: ReactNode;
}

export const ModalContainer = forwardRef<ModalContainerHandle>((props, ref) => {
    const [modal, setModal] = useState<JSX.Element | null>(null);
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
        set: (newModal: JSX.Element) => {
            setModal(newModal);
            requestAnimationFrame(() => setVisible(true));
        },
        close: () => {
            setVisible(false);
            setTimeout(() => setModal(null), 300);
        },
    }));

    return (
        <div className={`ModalContainer ${visible ? "show" : ""}`}>
            {modal}
        </div>
    );
});

export const Modal = forwardRef<ModalHandle, ModalProps>((props, ref) => {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);

    useImperativeHandle(ref, () => ({
        showModal: () => {
            setRender(true);
            requestAnimationFrame(() => setVisible(true));
        },
        hideModal: () => {
            setVisible(false);
            setTimeout(() => setRender(false), 300);
        },
    }));

    if (!render) return null;

    return (
        <div className={`Modal ${visible ? "show" : ""}`}>
            {props.children}
        </div>
    );
});