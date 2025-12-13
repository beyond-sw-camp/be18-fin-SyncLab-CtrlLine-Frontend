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
      <Button variant="outline" size="sm" class="cursor-pointer" @click="openCurrentPageInNewTab">
        <ExternalLinkIcon :size="15" class="mr-1" />
        <span class="text-xs">새 탭에서 열기</span>
      </Button>

      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/users/me" class="flex flex-row items-center gap-2">
              <Avatar>
                <AvatarFallback class="bg-primary/10 text-primary font-semibold">
                  {{ userStore.userEmail?.[0] ?? '?' }}
                </AvatarFallback>
              </Avatar>
              <span
                class="block font-medium max-w-[100px] min-w-0 whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {{ userStore.userName || '사용자' }}
              </span>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button
              class="cursor-pointer hover:bg-[#a00b30] transition-colors"
              @click="logoutAndClear"
            >
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
import { LogOutIcon, ExternalLinkIcon } from 'lucide-vue-next';
import { useRoute } from 'vue-router';

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
import { useUserStore } from '@/stores/useUserStore';

const { mutate: logout } = useLogout();

const userStore = useUserStore();
const queryClient = useQueryClient();
const route = useRoute();

const openCurrentPageInNewTab = () => {
  const fullPath = route.fullPath;
  window.open(fullPath, '_blank');
};

const logoutAndClear = () => {
  logout();
  queryClient.clear();
};
</script>
