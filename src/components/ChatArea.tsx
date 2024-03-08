
import { useEffect, useRef, useLayoutEffect, FormEvent , useState} from "react";
import { useParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useChat } from "ai/react";
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

interface ChatAreaProps {
  chatId: string;
  setChatId: (chatId: string) => void;
}
export const ChatArea = ({ chatId, setChatId }: ChatAreaProps) => {



    const params = useParams();

    const sendMessageToBackend = async (messageContent : any) => {
        await fetch("/api/save-message", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: chatId,
            message: messageContent,
        }),
        });
    };
    const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading  } = useChat({
        api: "/api/chat", 
        onFinish: (data) => {
            console.log("Onfinish data", data);
            sendMessageToBackend(data.content);
        },

    });

    const handleLoadChat = async () => {
        if (params.id && typeof params.id === "string") {
        setChatId(params.id);
        fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({  
            test: "testing",
            userId: params.id,
            loadMessages: true,
            }),
        }).then((resp) => {
            resp.json().then((data: any[]) => {
            if (data.length === 0) {
                return;
            }
            if (data.length > 0) {

                data = data.filter((item) => item.data.content);
                data = data.map((item, i) => {
                return {
                    content: item.data.content,
                    role: item.type,
                };
                });
            }
            data.reverse();
            setMessages(data);
            });
        });
        }
    };




    const handleAllSubmits = (e: any) => {

        if (e.key === "Enter") {
            console.log("chatId", e);
            handleSubmit(e, {
            options: {
            body: {
                userId: chatId,
            },
            },
        });
        }
    };

    const containerRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight || 0;
        }
    }, [messages]);

    useEffect(() => {
        handleLoadChat();
    }, []);


  

    return (
        <div className="h-screen w-full m-5 flex flex-col justify-between ">
        <div ref={containerRef} className="h-full flex flex-col overflow-y-auto overflow-x-hidden">
            {messages.length > 0
            ? messages.map((m) => (
                <div key={m.id} className={`${m.role === "user" ? "flex justify-end" : "flex justify-start"} my-1`}>
                    <div
                    className={`max-w-3/4 px-4 py-2 rounded-lg ${
                        m.role === "user" ? "bg-[#5138bb] text-[#edeaf7]" : "bg-[#edeaf7] text-[#0f0e24]"
                    }`}
                    >
                    <ReactMarkdown remarkPlugins={[gfm]} 
                    components={{ a: ({node, ...props}) => <a {...props} style={{color: 'blue'}} target="_blank" rel="noopener noreferrer" />}}
                      >{m.content}</ReactMarkdown>
                    </div>
                </div>
                ))
            : null}
        </div>
        <form onSubmit={handleAllSubmits} className="">
            <Textarea
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
            onKeyDown={handleAllSubmits}
            className="w-full my-2"
            />
        </form>
        </div>
    );
};