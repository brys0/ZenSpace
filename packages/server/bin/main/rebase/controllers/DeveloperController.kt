package rebase.controllers

import io.javalin.http.Context
import me.kosert.flowbus.EventsReceiver
import me.kosert.flowbus.GlobalBus
import me.kosert.flowbus.subscribe
import org.joda.time.Instant
import rebase.cache.UserCache
import rebase.schema.ChattyRelease

class DeveloperController(val userCache: UserCache) {
    val events = EventsReceiver()

    fun disableUser(ctx: Context) {
        val user = requireAuth(userCache, ctx)
        val userPath = ctx.pathParam("id")
        val userExt = userCache.users[userPath.toLong()]
        if (user != null && user.admin && userExt != null) {
            userExt.enabled = false
            userExt.save()
            ctx.status(204)
        } else {
            ctx.status(400).json(UserController.UserDataFail("User doesn't exist or you are not an Admin"))
        }
    }

    fun createRelease(ctx: Context) {
        val user = requireAuth(userCache, ctx)
        val body = ctx.bodyAsClass<ReleasePayload>()
        if (user != null && user.admin) {
            if (!body.checkForBlank()) {
                ctx.status(400).json("The following must not be blank: 'version','title','url','signature'")
                return
            }
            val release = ChattyRelease(body.version.replace(".", "").toInt(), body.version, body.title, body.notes, body.signature, body.url)
            userCache.saveOrReplaceRelease(release)
            ctx.status(201).json(release)
            GlobalBus.post(ServerUpdate(release))
        } else {
            ctx.status(400).json(UserController.UserDataFail("You are not an Admin"))
        }
    }
    init {
        events.subscribe<ConnectedClient> {
            when (it.inc) {
                true -> connectedClients.inc()
                false -> connectedClients.dec()
            }
        }
        events.subscribe<SentMessage> {
            sentMessages.inc()
        }
    }

    companion object {
        var connectedClients = 0
        var sentMessages = 0
        val serverStart = Instant.now()
    }

    data class ConnectedClient(val inc: Boolean)
    data class ReleasePayload(val version: String, val notes: String, val title: String, val url: String, val signature: String) {
        fun checkForBlank(): Boolean {
             if (version.isBlank()) return false
             if (title.isBlank()) return false
             if (url.isBlank()) return false
             if (signature.isBlank()) return false
            return true
        }
    }
    object SentMessage
}
