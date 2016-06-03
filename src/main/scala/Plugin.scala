import javax.servlet.ServletContext

import gitbucket.core.controller.{Context, ControllerBase}
import gitbucket.core.plugin.{PluginRegistry, Link}
import gitbucket.core.service.RepositoryService.RepositoryInfo
import gitbucket.core.service.SystemSettingsService.SystemSettings
import io.github.gitbucket.solidbase.model.Version
import mrkm4ntr.gitbucket.network.controller.NetworkController

class Plugin extends gitbucket.core.plugin.Plugin {

  override val pluginId: String = "network"

  override val pluginName: String = "Network Plugin"

  override val versions: Seq[Version] = Seq(
    new Version("1.0")
  )

  override val description: String = "Provides Network feature on Gitbucket."

  override val controllers = Seq(
    "/*" -> new NetworkController
  )

  override val repositoryMenus = Seq(
    (repositoryInfo: RepositoryInfo, context: Context) => Some(Link("network", "Network", "/network"))
  )

  override def javaScripts(registry: PluginRegistry, context: ServletContext, settings: SystemSettings): Seq[(String, String)] = {
    val path = settings.baseUrl.getOrElse(context.getContextPath)
    Seq(

    )
  }
}
