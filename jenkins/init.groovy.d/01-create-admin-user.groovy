import jenkins.model.Jenkins
import hudson.security.FullControlOnceLoggedInAuthorizationStrategy
import hudson.security.HudsonPrivateSecurityRealm

def jenkins = Jenkins.getInstanceOrNull()
if (jenkins == null) {
  return
}

def username = 'admin'
def password = 'admin'

def securityRealm = jenkins.getSecurityRealm()
if (!(securityRealm instanceof HudsonPrivateSecurityRealm)) {
  securityRealm = new HudsonPrivateSecurityRealm(false)
  jenkins.setSecurityRealm(securityRealm)
}

// Create or update the admin user
def existingUser = securityRealm.getUser(username)
if (existingUser == null) {
  securityRealm.createAccount(username, password)
  println "Created Jenkins admin user: ${username}"
} else {
  // Reset password for existing user
  existingUser.setPassword(password)
  println "Reset password for Jenkins admin user: ${username}"
}

def authorizationStrategy = jenkins.getAuthorizationStrategy()
if (!(authorizationStrategy instanceof FullControlOnceLoggedInAuthorizationStrategy)) {
  authorizationStrategy = new FullControlOnceLoggedInAuthorizationStrategy()
  authorizationStrategy.setAllowAnonymousRead(false)
  jenkins.setAuthorizationStrategy(authorizationStrategy)
}

jenkins.save()
println "Jenkins security configuration applied successfully"