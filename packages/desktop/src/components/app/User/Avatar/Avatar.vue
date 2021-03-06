<template>
  <div class="avatar"
    v-if="user.avatar == null"
    :style="`width: ${size}px; height: ${size}px`"
    :state="user.state"
    :circle="circle">
    <Missing :height="size"
      :width="size"
      color="var(--error)"
      class="avatar-src"
      :state="user.state"
      :circle="circle" />
  </div>
  <div class="avatar"
    :state="user.state"
    :circle="circle"
    v-else>
      <div class="loading"
        :style="`width: ${size}px; height: ${size}px`"
        :loaded="loaded">
        <img :src="user.getAvatar() + `?size=64`"
          :height="size"
          :width="size"
          class="avatar-src"
          :circle="circle"
          :style="!loaded ? 'display: none;' : 'display: block;'"
          :state="user.state"
          @load="loaded = true" />
      </div>
  </div>
  <slot />
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { ClientStore } from '../../../../stores/ClientStore';
import { Filter } from './_extensions/AvatarFilter';
import Missing from '@/components/Icons/Missing.vue';
import { User } from '@/lib/structures/Users';

export default defineComponent({
  name: 'Avatar',
  props: {
    size: {
      type: String,
      required: false,
      default: () => '32',
    },
    filter: {
      type: String,
      required: false,
      default: () => 'None' as Filter,
    },
    user: {
      type: Object as PropType<User>,
      required: true,
    },
    circle: Boolean,
  },
  setup() {
    let client = ClientStore();
    return {
      client: computed(() => client.client),
    };
  },
  components: { Missing },
  data() {
    return {
      loaded: false,
      errored: false
    };
  },
});
</script>

<style lang="scss" scoped>
.avatar {
  &[state='1'] {
    border: var(--green) 2px solid;
  }

  &[state='2'] {
    border: var(--yellow) 2px solid;
  }

  &[state='3'] {
    border: var(--red) 2px solid;
  }

  &[circle='true'] {
    border-radius: 50%;
  }

  padding: 2px;
  box-shadow: 0px 0px 12px 2px rgba(0, 0, 0, 0.3);
}

.avatar-src {
  &[circle='true'] {
    border-radius: 50%;
  }

}

.loading {
  &[loaded='false'] {
    &[errored='false'] {


      background-color: #2a2a2a;
      border-radius: 50%;
      border-top: 2px var(--blue) solid;
      border-bottom: 2px var(--orange) solid;
      border-right: 2px var(--green) solid;
      border-left: 2px var(--red) solid;
      animation: rotate 500ms ease infinite forwards;
    }
  }

  &[errored='true'] {
    background-color: var(--error);
    border-radius: 50%;
    animation: rotate 500ms ease infinite forwards;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
