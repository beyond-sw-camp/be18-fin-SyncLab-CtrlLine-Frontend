<template>
  <header class="flex items-center justify-between h-14 border-b bg-background px-6">
    <div class="flex items-center gap-3">
      <!-- 로고 -->
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/" class="flex items-center gap-2">
              <span class="text-lg font-bold tracking-tight">SyncLab</span>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <BreadcrumbBar />

      <Separator orientation="vertical" class="mx-3 h-5" />
    </div>

    <div class="flex items-center gap-4">
      <Sheet>
        <SheetTrigger>
          <div class="relative rounded-full p-2 hover:bg-muted transition">
            <Bell class="h-5 w-5 text-foreground cursor-pointer" />
            <span class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
          </div>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>알림 목록</SheetTitle>
            <SheetDescription> 알림 기록 모음 </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/users/me" class="flex flex-row items-center gap-2">
              <Avatar>
                <AvatarFallback class="bg-primary/10 text-primary font-semibold">
                  S
                </AvatarFallback>
              </Avatar>
              <span class="font-medium">SyncLab</span>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  </header>
</template>

<script setup>
import { Bell } from 'lucide-vue-next';

import BreadcrumbBar from '@/components/topnav/BreadcrumbBar.vue';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
</script>
