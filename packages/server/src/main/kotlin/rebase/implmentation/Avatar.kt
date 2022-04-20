package rebase.implmentation

import rebase.interfaces.ISnowflake
import rebase.interfaces.Image.AvatarImpl

/**
 * Represents a user/bot avatar in Chatty
 */
class Avatar(
    override val cdn: String,
    override val animated: Boolean,
    override val id: ISnowflake,
    override val size: Long,
    override val connectedUser: String
) : AvatarImpl {
    /**
     * Allows you to get the limited avatar data for Serialization
     */
    fun getAvatar() = this as AvatarImpl
    override fun getEffectiveURL() = "${cdn}/${connectedUser}/${if (animated) "a_" else ""}${id}"
}