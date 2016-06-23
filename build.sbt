val Organization = "com.github.mrkm4ntr"
val Name = "gitbucket-network-plugin"
val Version = "1.1"

lazy val root = (project in file(".")).enablePlugins(SbtTwirl)

organization := Organization
name := Name
version := Version
scalaVersion := "2.11.8"

resolvers ++= Seq(
  "amateras-repo" at "http://amateras.sourceforge.jp/mvn/"
)

libraryDependencies ++= Seq(
  "gitbucket" % "gitbucket-assembly" % "4.0.0" % "provided",
  "com.typesafe.play" %% "twirl-compiler" % "1.0.4" % "provided",
  "javax.servlet" % "javax.servlet-api" % "3.1.0" % "provided"
)

scalacOptions := Seq("-deprecation", "-feature", "-language:postfixOps")
