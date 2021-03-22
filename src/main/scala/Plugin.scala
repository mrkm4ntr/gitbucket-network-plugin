import gitbucket.core.controller.Context
import gitbucket.core.plugin.Link
import gitbucket.core.service.RepositoryService.RepositoryInfo
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
    new Version("1.5"),
    new Version("1.6.0"),
    new Version("1.6.1"),
    new Version("1.7.0"),
    new Version("1.8.0"),
    new Version("1.8.1"),
    new Version("1.9.0"),
    new Version("1.9.1")
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
