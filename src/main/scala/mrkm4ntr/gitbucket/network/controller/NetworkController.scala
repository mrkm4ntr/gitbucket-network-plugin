package mrkm4ntr.gitbucket.network.controller

import gitbucket.core.controller.{Context, ControllerBase}
import gitbucket.core.service.{AccountService, RepositoryService, RequestCache}
import gitbucket.core.util.{ReferrerAuthenticator, StringUtil}
import gitbucket.core.util.Directory._
import gitbucket.core.util.ControlUtil._
import mrkm4ntr.gitbucket.html
import org.eclipse.jgit.api.Git
import org.eclipse.jgit.revplot.{PlotWalk, PlotLane, PlotCommitList}
import scala.collection.JavaConverters._

class NetworkController extends NetworkControllerBase
  with RepositoryService with AccountService with ReferrerAuthenticator with RequestCache

trait NetworkControllerBase extends ControllerBase {
  self: RepositoryService with AccountService with ReferrerAuthenticator with RequestCache =>

  before("*/*/network/commits") {
    contentType = formats("json")
  }

  get("/:owner/:repository/network")(referrersOnly { repository =>
    html.network(repository)
  })

  get("/:owner/:repository/network/commits")(referrersOnly { repository =>
    using(Git.open(getRepositoryDir(repository.owner, repository.name))) { git =>
      val repo = git.getRepository
      val revWalk = new PlotWalk(repo)
      val rootId = repo.resolve("HEAD")
      val root = revWalk.parseCommit(rootId)
      revWalk.markStart(root)

      val plotCommitList = new PlotCommitList[PlotLane]
      plotCommitList.source(revWalk)
      plotCommitList.fillTo(100)

      val commitList = plotCommitList.asScala.zipWithIndex

      commitList.map { case (plotCommit, i) =>
        Commit(
          i,
          plotCommit.getLane.getPosition,
          plotCommit.getParents.toList.map { revCommit =>
            commitList.find { case (p, i) => p.getId == revCommit.getId } map { case (p, i) => Parent(i, p.getLane.getPosition) }
          } flatten,
          plotCommit.getId.getName,
          plotCommit.getShortMessage,
          getAvatarUrl(plotCommit.getAuthorIdent.getEmailAddress, 30)
        )
      }
    }
  })

  def getAvatarUrl(mailAddress: String, size: Int)(implicit context: Context): String = {
    getAccountByMailAddress(mailAddress).map { account =>
      if (account.image.isEmpty && context.settings.gravatar) {
        s"""https://www.gravatar.com/avatar/${StringUtil.md5(account.mailAddress.toLowerCase)}?s=${size}&d=retro&r=g"""
      } else {
        s"""${context.path}/${account.userName}/_avatar"""
      }
    } getOrElse {
      if (context.settings.gravatar) {
        s"""https://www.gravatar.com/avatar/${StringUtil.md5(mailAddress.toLowerCase)}?s=${size}&d=retro&r=g"""
      } else {
        s"""${context.path}/_unknown/_avatar"""
      }
    }
  }
}

case class Commit(
  index: Int,
  lane: Int,
  parents: Seq[Parent],
  id: String,
  message: String,
  avatarUrl: String)

case class Parent(
  index: Int,
  lane: Int)
