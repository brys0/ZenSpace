<template>
  <Overlay @click="outsideClicked">
    <div class="modal-wrap" @click.stop="" @mousedown="shouldEmit = false">
      <div class="modal-top" :style="(headerbg) ? `background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${headerbg}); background-repeat: repeat; background-position: 50% 50%; background-size: contain;` : ''">
        <div class="header">
          <slot name="icon" />
          <slot name="name" />
        </div>
        <div class="body">
          <slot name="body" />
        </div>
      </div>
      <div class="modal-bottom">
        <div class="actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </Overlay>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Overlay from '@/components/app/Modal/_base/Overlay.vue';

export default defineComponent({
  name: 'Modal',
  components: {Overlay},
  methods: {
    outsideClicked() {
      if (!this.shouldEmit) {
        this.shouldEmit = true;
        return
      }
      this.$emit('clicked');
    },
  },
  props: {
    headerbg: String
  },
  data() {
    return {
      shouldEmit: true
    }
  }
});
</script>

<style lang="scss" scoped>
.modal-wrap {
  width: 500px;
  padding: 1rem;
  animation: show 210ms ease forwards;

  .modal-top {
    padding: 1rem;
    width: 100%;
    background: var(--modal);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);
    .header {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 0.375rem;
      .name {
        margin-left: 4px;
      }
    }
  }
  .modal-bottom {
    background-color: var(--modal-def-action);
    width: 100%;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding: 1rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);
  }
}
.actions {
  width: 100%;
}
</style>
