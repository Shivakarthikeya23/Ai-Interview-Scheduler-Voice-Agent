"use client"
import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "@/components/ui/sidebar"
import { SideBarOptions } from "@/services/Constants"
import { Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Logo from "@/components/Logo"
  
  export function AppSidebar() {
    const path = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    return (
      <Sidebar>
        <SidebarHeader className='flex items-center mt-5 space-y-4'>
        <Logo />
        <Button className='w-full mt-5 p-5'> <Plus /> Create new interview </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarContent>
                <SidebarMenu>
                    {SideBarOptions.map((option, index) => (
                        <SidebarMenuItem key={index} className='p-1'>
                            <SidebarMenuButton asChild className={`p-5 text-[16px] ${mounted && path == option.path ? 'bg-green-50' : ''}`}>
                                <Link href={option.path}>    
                                <option.icon className={`${mounted && path == option.path ? 'text-primary' : ''}`}/>
                                <span className={`text-[16px] ${mounted && path == option.path ? 'text-primary font-medium' : ''}`}>{option.name}</span>
                                </Link>
 
                            </SidebarMenuButton>
                        </SidebarMenuItem> 
                    ))}
                </SidebarMenu>
            </SidebarContent>
          </SidebarGroup>
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    )
  }