<template>
    <div class="channel-title">
      <div class="__icon">
        <slot name="icon" />
      </div>
      <span class="__title">
        <slot name="title" />
      </span>
      <div class="__actions">
        <slot name="actions" />
      </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'ChannelTitle',
});
</script>

<style lang="scss" scoped>
.channel-title {
  background-color: var(--titlebar);
  padding: 4px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  height: 42px;
  animation: moveDown 60ms ease forwards;
  box-shadow: 0px 5px 9px -3px var(--titlebar);
  .__icon {
    max-height: 64px;
    max-width: 64px;
  }
  .__title {
    font-weight: bold;
    color: var(--white);
    font-size: calc(var(--font-size) + 12px);
    margin-left: 10px;
    transition: opacity 250ms;
  }
  .__actions {
    display: flex;
    margin-left: auto;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
}

@keyframes moveDown {
  from {
    transform: translateY(-46px);
  }
  to {
    transform: translateY(0);
  }
}
</style>
