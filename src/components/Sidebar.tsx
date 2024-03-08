import { useState, useEffect } from "react"; 
import { useParams } from "next/navigation"; 
import { Button } from "@/components/ui/button"; 
import { SidebarNav } from "@/components/ui/sidebar-nav"; 
import { useRouter } from "next/navigation"; 

interface Item {
  href: string;
  title: string;
}

interface SidebarProps {
  userId: string;
}

export const Sidebar = ({ userId }: SidebarProps) => {
  const params = useParams();
  const [items, setItems] = useState<Item[]>([]);
  const router = useRouter();


  const handleRetrieveSidebar = async () => {
    const response = await fetch("/api/retrieve-history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatHistoryAction: "retrieve", userId }),
    });

    if (response.ok) {

      let chatHistory = await response.json();
      console.log("chatHistory", chatHistory);
      chatHistory = chatHistory.reverse();
      let dbChatHistory = chatHistory.map((item: string) => {
        let parseDate = Number(item.replace(`${userId}-`, ""));
        return {
          href: `/chat-history/${item}`,
          title: new Date(parseDate).toLocaleString(),
        };
      });

      if (
        params.id &&
        dbChatHistory.filter((item: { href: string }) => item.href === `/chat-history/${params.id}`).length === 0
      ) {
        const unixTime = params.id.toString().replaceAll(`${userId}-`, "");

        setItems([
          {
            href: `/chat-history/${userId}-${unixTime}`,
            title: new Date(Number(unixTime)).toLocaleString(),
          },
          ...dbChatHistory,
        ]);
      } else {
        setItems(dbChatHistory);
      }
    } else {
      console.error("Error retrieving chat history");
    }
  };


  const handleUpdateSidebar = async () => {
    const chatId = Date.now().toString();
    router.push(`/chat-history/${userId}-${chatId}`);
  };


  useEffect(() => {
    handleRetrieveSidebar();
  }, []);

  return (
    <div className="w-64 h-full top-0 overflow-y-auto bg-[#1e122a] flex flex-col justify-top px-2">
      <div className="ml-auto w-full">
        <Button className="w-full my-2 bg-[#6c6c74]" onClick={handleUpdateSidebar}>
          New Chat
        </Button>
      </div>
      <SidebarNav items={items} className="flex-col" />
    </div>
  );
};