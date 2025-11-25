<template>
  <header class="flex items-center justify-between h-14 border-b bg-background px-6">
    <div class="flex items-center gap-3">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/" class="flex items-center gap-2 hover:bg-transparent">
              <img src="@/assets/logo.png" class="h-10" alt="logo" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <BreadcrumbBar />
    </div>

    <div class="flex items-center gap-4">
      <Sheet>
        <SheetTrigger>
          <div class="relative rounded-full p-2 hover:bg-muted transition">
            <BellIcon class="h-5 w-5 text-foreground cursor-pointer" />
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
                  {{ userStore.userEmail?.[0] ?? '?' }}
                </AvatarFallback>
              </Avatar>
              <span class="font-medium">{{ userStore.userName || '사용자' }}</span>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button class="cursor-pointer" @click="logout">
              <LogOutIcon />
            </Button>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  </header>
</template>

<script setup>
import { useQueryClient } from '@tanstack/vue-query';
import { BellIcon, LogOutIcon } from 'lucide-vue-next';

import useLogout from '@/apis/query-hooks/auth/useLogout';
import BreadcrumbBar from '@/components/topnav/BreadcrumbBar.vue';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useUserStore } from '@/stores/useUserStore';

const { mutate: logoutTest } = useLogout();

const userStore = useUserStore();
const queryClient = useQueryClient();

const logout = () => {
  logoutTest();
  queryClient.clear();
};
</script>
