val Organization = "com.github.mrkm4ntr"
val Name = "gitbucket-network-plugin"
val Version = "1.6.1"

lazy val root = (project in file(".")).enablePlugins(SbtTwirl)

organization := Organization
name := Name
version := Version
scalaVersion := "2.13.0"
gitbucketVersion := "4.32.0"

resolvers ++= Seq(
  Resolver.jcenterRepo
)

scalacOptions := Seq("-deprecation", "-feature", "-language:postfixOps")
