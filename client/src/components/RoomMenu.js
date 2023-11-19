import { useState } from "react";
import ChatBox from "./ChatBox";

export default function RoomMenu({ email }) {

  return (
    <>
    <ChatBox email={email}/>
    </>
  );
}
