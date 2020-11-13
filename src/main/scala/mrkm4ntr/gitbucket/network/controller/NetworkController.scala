package mrkm4ntr.gitbucket.network.controller

import java.util.Date
import java.time._
import java.time.temporal.ChronoUnit

import gitbucket.core.controller.{Context, ControllerBase}
import gitbucket.core.service.{AccountService, RepositoryService, RequestCache}
import gitbucket.core.util.{ReferrerAuthenticator, StringUtil}
import gitbucket.core.util.Directory._
import mrkm4ntr.gitbucket.html
import org.eclipse.jgit.api.Git
import org.eclipse.jgit.revplot.{PlotCommit, PlotCommitList, PlotLane, PlotWalk}
import org.eclipse.jgit.revwalk.RevSort

import org.json4s.jackson.Serialization
import scala.annotation.tailrec
import scala.jdk.CollectionConverters._
import scala.util.Using

class NetworkController extends NetworkControllerBase
  with RepositoryService with AccountService with ReferrerAuthenticator with RequestCache

trait NetworkControllerBase extends ControllerBase {
  self: RepositoryService with AccountService with ReferrerAuthenticator with RequestCache =>

  get("/:owner/:repository/network")(referrersOnly { repository =>
    html.network(repository)
  })

  get("/:owner/:repository/network/commits") {
    contentType = formats("json")
    referrersOnly { repository =>
      Using.resource(Git.open(getRepositoryDir(repository.owner, repository.name))) { git =>

        @tailrec
        def traverse(plotCommitList: List[(PlotCommit[PlotLane], Int)],
                     nextCommitDate: Option[Date],
                     maxLane: Int,
                     result: List[Commit]): (Int, List[Commit]) = {
          plotCommitList match {
            case Nil => (maxLane, result)
            case (plotCommit, index) :: tail =>
              val (month, day) = getDateMarker(plotCommit.getCommitterIdent.getWhen, nextCommitDate)
              traverse(tail,
                Some(plotCommit.getCommitterIdent.getWhen),
                maxLane max plotCommit.getLane.getPosition,
                Commit(
                  index,
                  plotCommit.getLane.getPosition,
                  plotCommit.getParents.toList.map { revCommit =>
                    tail.find { case (p, _) => p.getId == revCommit.getId } map { case (p, i) => Parent(i, p.getLane.getPosition) }
                  },
                  for (i <- Range(0, plotCommit.getRefCount)) yield getHeadOrTag(plotCommit.getRef(i).getName),
                  plotCommit.getId.getName,
                  plotCommit.getShortMessage,
                  getAvatarUrl(plotCommit.getAuthorIdent.getEmailAddress, 30),
                  month,
                  day
                ) :: result
              )
          }
        }

        val allBranches = params.get("all")
        val currentBranch = params.getOrElse("branch", repository.repository.defaultBranch)
        val count = params.getOrElse("count", "100").toInt
        val repo = git.getRepository
        val revWalk = new PlotWalk(repo)
        revWalk.sort(RevSort.COMMIT_TIME_DESC)
        try {
          if(allBranches.isDefined) {
            revWalk.markStart(repository.branchList.map(repo.resolve).map(revWalk.parseCommit(_)).asJava)
          } else {
            revWalk.markStart(revWalk.parseCommit(repo.resolve(currentBranch)))
          }
          val plotCommitList = new PlotCommitList[PlotLane]
          plotCommitList.source(revWalk)
          plotCommitList.fillTo(count)
          val result = traverse(plotCommitList.asScala.zipWithIndex.toList, None, 0, Nil)
          Serialization.write(Data(result._1, result._2.reverse, repository.branchList, currentBranch, repository.repository.defaultBranch, allBranches))(jsonFormats)
        } finally {
          revWalk.dispose()
        }
      }
    }
  }

  def getDateMarker(date1: Date, date2: Option[Date]): (Option[Int], Option[Int]) = date2.map { date2 =>
    val dateTime1 = LocalDateTime.ofInstant(date1.toInstant, ZoneId.systemDefault())
    val dateTime2 = LocalDateTime.ofInstant(date2.toInstant, ZoneId.systemDefault())
    val day = if (ChronoUnit.DAYS.between(dateTime1.toLocalDate, dateTime2.toLocalDate) > 0) {
      Some(dateTime1.getDayOfMonth)
    } else {
      None
    }
    val month = if (ChronoUnit.MONTHS.between(YearMonth.from(dateTime1), YearMonth.from(dateTime2)) > 0) {
      Some(dateTime1.getMonthValue)
    } else {
      None
    }
    (month, day)
  } getOrElse {
    val dateTime1 = LocalDateTime.ofInstant(date1.toInstant, ZoneId.systemDefault())
    (Some(dateTime1.getMonthValue), Some(dateTime1.getDayOfMonth))
  }

  def getAvatarUrl(mailAddress: String, size: Int)(implicit context: Context): String = {
    getAccountByMailAddressFromCache(mailAddress).map { account =>
      if (account.image.isEmpty && context.settings.gravatar) {
        s"""https://www.gravatar.com/avatar/${StringUtil.md5(account.mailAddress.toLowerCase)}?s=$size&d=retro&r=g"""
      } else {
        s"""${context.path}/${account.userName}/_avatar"""
      }
    } getOrElse {
      if (context.settings.gravatar) {
        s"""https://www.gravatar.com/avatar/${StringUtil.md5(mailAddress.toLowerCase)}?s=$size&d=retro&r=g"""
      } else {
        s"""${context.path}/_unknown/_avatar"""
      }
    }
  }

  def getHeadOrTag(refName: String): Option[String] = refName.split("/").toList match {
    case head :: Nil => Some(head)
    case _ :: kind :: name :: Nil if kind == "heads" || kind == "tags" => Some(name)
    case _ => None
  }
}

case class Data(
  maxLane: Int,
  commits: Seq[Commit],
  branches: Seq[String],
  currentBranch: String,
  defaultBranch: String,
  all: Option[String])

case class Commit(
  index: Int,
  lane: Int,
  parents: Seq[Option[Parent]],
  refs: Seq[Option[String]],
  id: String,
  message: String,
  avatarUrl: String,
  month: Option[Int],
  day: Option[Int])

case class Parent(
  index: Int,
  lane: Int)
