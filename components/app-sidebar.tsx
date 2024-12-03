'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home } from 'lucide-react';
import LogoSvg from './svgs/logo';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const pathname = usePathname();

  const catalog = [
    {
      title: '概览',
      menus: [
        {
          title: '介绍',
          url: '/overview/introduce',
          icon: Home,
        },
        {
          title: '开始',
          url: '/overview/start',
          icon: Home,
        },
        {
          title: '应用案例',
          url: '/overview/example',
          icon: Home,
        },
      ],
    },
    {
      title: '视图',
      menus: [
        {
          title: 'Paint',
          url: '/view/paint',
          icon: Home,
        },
        {
          title: 'Transform',
          url: '/view/transform',
          icon: Home,
        },
        {
          title: 'Collision',
          url: '/view/collision',
          icon: Home,
        },
        {
          title: 'Math',
          url: '/view/math',
          icon: Home,
        },
      ],
    },
    {
      title: '模型',
      menus: [
        {
          title: 'Cell',
          url: '/model/cell',
          icon: Home,
        },
        {
          title: 'Point',
          url: '/model/point',
          icon: Home,
        },
      ],
    },
    {
      title: '控制器',
      menus: [
        {
          title: 'Body',
          url: '/control/body',
          icon: Home,
        },
        {
          title: 'Fsm',
          url: '/control/fsm',
          icon: Home,
        },
        {
          title: 'Cmd',
          url: '/',
          icon: Home,
        },
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center	p-2 pb-4 border-b">
          <LogoSvg className="w-10 h-10 pr-2 fill-red-600" />
          <h1 className="text-xl text-black">Cell</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {catalog.map((item, index1) => {
          return (
            <SidebarGroup key={index1}>
              <SidebarGroupLabel className="text-lg text-black pb-4">
                {item.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.menus.map((it, index2) => (
                    <SidebarMenuItem key={index2}>
                      <SidebarMenuButton asChild isActive={it.url == pathname}>
                        <a href={it.url}>
                          <it.icon />
                          <span>{it.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
