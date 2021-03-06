package rebase.interfaces.Image

/**
 * Interface that represents any image on Chatty
 * @param cdn What CDN url is this image attached to
 * @param animated Is this image animated?
 * @param id Unique ID of the image
 */
interface ImageImpl {
    val cdn: String
    val animated: Boolean
    val id: Long
}
