<template>
    <div class="friend-channel-header">
         <ChannelTitle>
            <template v-slot:title>
                <span :key="friend.name">{{friend.name}}</span>
            </template>
            <template v-slot:icon>
                <Avatar :circle="true" :user="friend"/>
            </template>
            <template v-slot:actions>
                <button class="db" dbt="default" disabled v-if="false"> 
                    <CallWifi color="var(--white)"/>
                </button> 
                <button class="db" dbt="default" :disable="!channelSettingsExperiment" @click="(channelSettingsExperiment) ? $emit('open') : () => {}"> 
                    <Settings color="var(--white)"/>
                </button> 
            </template>
        </ChannelTitle>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import ChannelTitle from "../ChannelTitle.vue";
import { User } from "@/lib/structures/Users";
import Avatar from "@/components/app/User/Avatar/Avatar.vue";
import CallWifi from "@/components/Icons/CallWifi.vue";
import Settings from '@/components/Icons/Settings.vue'
import { AppStore } from "@/stores/AppStore";
export default defineComponent({
    name: 'DMTitle',
    components: {ChannelTitle, Avatar, CallWifi, Settings},
    props: {
        friend: {
            type: Object as PropType<User>,
            required: true
        }
    },
    setup() {
        let appStore = AppStore();
        return {
            channelSettingsExperiment: computed(() => appStore.experiments.get('dmSettings'))
        }
    }
})
</script>

<style lang="scss" scoped>

</style>