<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { NIcon } from 'naive-ui';
import { useAppStore } from '../stores/AppStore';
const appStore = useAppStore();
const userExists = computed(() => appStore.account != null);

const Tooltip = defineAsyncComponent({
    loader: () => import('naive-ui/lib/tooltip/src/Tooltip')
});
const Button = defineAsyncComponent({
    loader: () => import('naive-ui/lib/button/src/Button')
});
const LogoWindows = defineAsyncComponent({
    loader: () => import('@vicons/ionicons5/LogoWindows')
});
const BrowsersOutline = defineAsyncComponent({
    loader: () => import('@vicons/ionicons5/BrowsersOutline')
});
const CogOutline = defineAsyncComponent({
    loader: () => import('@vicons/ionicons5/CogOutline')
});
const LogOutOutline = defineAsyncComponent({
    loader: () => import('@vicons/ionicons5/LogOutOutline')
});
</script>
<template>
    <div class="options">
        <!-- <img src="../assets/RightHere.svg" height="148" class="img-l"/> -->
        <div class="wrap">
            <Tooltip trigger="hover">
                <template #trigger>
                    <Button size="large" class="download-btn btn" type="primary" disabled>
                        <template #icon>
                            <NIcon>
                                <LogoWindows />
                            </NIcon>
                        </template>
                        Download For Windows
                    </Button>
                </template>
                You don't want to see that anyways...
            </Tooltip>
            <Tooltip trigger="hover">
                <template #trigger>
                    <Button size="large" class="web-btn space btn" type="info" tertiary disabled>
                        <template #icon>
                            <NIcon>
                                <BrowsersOutline />
                            </NIcon>
                        </template>
                        Open Web Client
                    </Button>
                </template>
                I haven't even created the project yet 💀
                <!-- <img src="../assets/RightHereHFlip.svg" height="148" class="img-r"/> -->
            </Tooltip>
        </div>
        <Button text type="info" tag="a" size="large" href="/settings/profile" :style="{width: 'fit-content'}">
            <template #icon>
                <CogOutline />
            </template>
            Account Settings
        </Button>
        <Button text type="error" size="large" @click="$router.push('logout')" v-if="userExists" :style="{width: 'fit-content'}">
            <template #icon>
                <LogOutOutline />
            </template>
            Logout
        </Button>
    </div>
</template>

<style lang="scss" scoped>
.options {
    display: flex;
    flex-direction: column;
    align-items: center;
    .wrap {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: auto;
        justify-content: space-between;
        margin-top: 25px;

        .btn {
            margin: 20px;
        }

        img {
            position: absolute;

            &.img-l {
                margin-left: -148px;
                margin-top: 95px;
            }

            &.img-r {
                margin-left: 220px;
                margin-top: 95px;
            }
        }
    }
}
@media only screen and (max-width: 1147px) {
  .options {
    .wrap {
        flex-direction: column;
    }
  }
}
</style>