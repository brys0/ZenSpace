<template>
  <div class="sms-message"
    :prevchain="prevchain"
    :self="self">
    <div class="__wrapper"
      :self="self">
      <div class="avatar-wrap">
        <tippy :content="message.getUser()!!.name">
          <Avatar :user="message.getUser()!!"
            class="raw-avatar"
            circle
            v-if="!prevchain" />
        </tippy>
      </div>

      <div class="__text__wrapper"
        :prevchain="prevchain"
        :self="self">
        <span class="__text">{{ message.content }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Message } from '@/lib/structures/Messages';
import Avatar from '../../User/Avatar/Avatar.vue';
export default defineComponent({
  name: 'SMSMessage',
  components: { Avatar },
  props: {
    message: {
      type: Object as PropType<Message>,
      required: true,
    },
    prevchain: Boolean,
    self: Boolean,
  },
});
</script>

<style lang="scss" scoped>
.sms-message {
  margin: 8px;
  display: flex;

  &[self='true'] {
    justify-content: flex-end;
  }

  .__wrapper {
    display: inline-flex;
    flex-direction: wrap;
    align-items: flex-end;
    &[self='true'] {
      flex-direction: row-reverse;
    }

    .__text__wrapper {
      padding-top: 6px;
      border-radius: 8px;
      padding-bottom: 6px;
      max-width: 25vw;
      word-wrap: break-word;
      padding-left: 10px;
      padding-right: 10px;
      margin-left: 5px;
      background-color: var(--sb);
      box-shadow: 8px 17px 15px 0px rgba(0, 0, 0, 0.3);

      &[self='true'] {
        margin-left: 0;
        margin-right: 5px;
      }

      .__text {
        color: var(--text);
      }
    }
  }
}
</style>
