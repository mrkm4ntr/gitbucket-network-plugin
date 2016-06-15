package mrkm4ntr.gitbucket.network.controller

import java.net.URI
import java.nio.file._
import java.util
import java.util.Date

import gitbucket.core.controller.{Context, ControllerBase}
import gitbucket.core.service.{AccountService, RepositoryService, RequestCache}
import gitbucket.core.util.{ReferrerAuthenticator, StringUtil}
import gitbucket.core.util.Directory._
import gitbucket.core.util.ControlUtil._
import mrkm4ntr.gitbucket.html
import org.eclipse.jgit.api.Git
import org.eclipse.jgit.revplot.{PlotCommit, PlotCommitList, PlotLane, PlotWalk}
import org.eclipse.jgit.revwalk.RevSort
import org.joda.time._

import scala.annotation.tailrec
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

  get("/assets/plugins/network/bundle.js") {
    contentType = "text/javascript"
    val uri = getClass().getResource("bundle.js").toString()
    val tmp = uri.split("!")
    try {
      val fs = FileSystems.getFileSystem(URI.create(tmp(0)))
      new String(Files.readAllBytes(fs.getPath(tmp(1))))
    } catch {
      case e: FileSystemNotFoundException => {
        val fs = FileSystems.newFileSystem(URI.create(tmp(0)), new util.HashMap[String, String]())
        new String(Files.readAllBytes(fs.getPath(tmp(1))))
      }
    }
  }

  get("/:owner/:repository/network/commits")(referrersOnly { repository =>
    using(Git.open(getRepositoryDir(repository.owner, repository.name))) { git =>

      @tailrec
      def traverse(plotCommitList: List[(PlotCommit[PlotLane], Int)],
                   nextCommitDate: Option[Date],
                   maxLane: Int,
                   result: List[Commit]): (Int, List[Commit]) = {
        plotCommitList match {
          case Nil => (maxLane, result)
          case (plotCommit, index) :: tail => {
            val (month, day) = getDateMarker(plotCommit.getCommitterIdent.getWhen, nextCommitDate)
            traverse(tail,
              Some(plotCommit.getCommitterIdent.getWhen),
              maxLane max plotCommit.getLane.getPosition,
              Commit(
                index,
                plotCommit.getLane.getPosition,
                plotCommit.getParents.toList.map { revCommit =>
                  tail.find { case (p, i) => p.getId == revCommit.getId } map { case (p, i) => Parent(i, p.getLane.getPosition) }
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
      }

      val currentBranch = params.get("branch")
      val count = params.getOrElse("count", "100").toInt
      val repo = git.getRepository
      val revWalk = new PlotWalk(repo)
      revWalk.sort(RevSort.COMMIT_TIME_DESC)
      try {
        currentBranch match {
          case Some(branch) => revWalk.markStart(revWalk.parseCommit(repo.resolve(branch)))
          case _ => revWalk.markStart(repository.branchList.map(repo.resolve(_)).map(revWalk.parseCommit(_)).asJava)
        }
        val plotCommitList = new PlotCommitList[PlotLane]
        plotCommitList.source(revWalk)
        plotCommitList.fillTo(count)
        val result = traverse(plotCommitList.asScala.zipWithIndex.toList, None, 0, Nil)
        Data(result._1, result._2.reverse, repository.branchList, currentBranch)
      } finally {
        revWalk.dispose()
      }
    }
  })

  def getDateMarker(date1: Date, date2: Option[Date]): (Option[Int], Option[Int]) = date2.map { date2 =>
    val dateTime1 = new DateTime(date1)
    val dateTime2 = new DateTime(date2)
    val day = if (Days.daysBetween(
      new LocalDate(dateTime1.getYear, dateTime1.getMonthOfYear, dateTime1.getDayOfMonth),
      new LocalDate(dateTime2.getYear, dateTime2.getMonthOfYear, dateTime2.getDayOfMonth)).getDays > 0) {
      Some(dateTime1.getDayOfMonth)
    } else {
      None
    }
    val month = if (Months.monthsBetween(
      new YearMonth(dateTime1.getYear, dateTime1.getMonthOfYear),
      new YearMonth(dateTime2.getYear, dateTime2.getMonthOfYear)).getMonths > 0) {
      Some(dateTime1.getMonthOfYear)
    } else {
      None
    }
    (month, day)
  } getOrElse {
    val dateTime1 = new DateTime(date1)
    (Some(dateTime1.getMonthOfYear), Some(dateTime1.getDayOfMonth))
  }

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

  def getHeadOrTag(refName: String) = refName.split("/").toList match {
    case head :: Nil => Some(head)
    case _ :: kind :: name :: Nil if kind == "heads" || kind == "tags" => Some(name)
    case _ => None
  }
}

case class Data(
  maxLane: Int,
  commits: Seq[Commit],
  branches: Seq[String],
  currentBranch: Option[String])

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
