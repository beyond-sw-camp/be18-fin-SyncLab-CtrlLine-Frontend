<template>
  <div class="flex flex-col min-h-screen">
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="/">SyncLab</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/docs/introduction"></NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/users/me">
            <span>
              <Avatar>
                <AvatarFallback class="bg-primary-400/60">사</AvatarFallback>
              </Avatar>
            </span>
            <span>사용자</span>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
    <div class="flex flex-1">
      <Sidebar />
      <main class="flex-1 bg-muted/20 p-3 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import Sidebar from '@/components/sidebar/Sidebar.vue';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
</script>
