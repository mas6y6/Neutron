import express from "express";

export async function run(...args: string[]) {
    console.log("Starting Neutron Server...");
    console.log("Current: " + process.cwd());
    console.log("Args: " + args);


}