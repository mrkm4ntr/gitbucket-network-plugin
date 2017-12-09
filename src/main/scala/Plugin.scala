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
    new Version("1.0"),
    new Version("1.1"),
    new Version("1.2-SNAPSHOT"),
    new Version("1.2"),
    new Version("1.3"),
    new Version("1.4"),
    new Version("1.5")
  )

  override val description: String = "Provides Network feature on Gitbucket."

  override val controllers = Seq(
    "/*" -> new NetworkController
  )

  override val assetsMappings = Seq("/network" -> "/plugins/network/assets")

  override val repositoryMenus = Seq(
    (repositoryInfo: RepositoryInfo, context: Context) => Some(Link("network", "Network", "/network", Some("circuit-board")))
  )

}
