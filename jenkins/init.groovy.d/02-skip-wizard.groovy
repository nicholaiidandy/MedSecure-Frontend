// Skip the setup wizard by marking it as complete
import jenkins.model.Jenkins

def jenkins = Jenkins.getInstanceOrNull()
if (jenkins == null) {
    return
}

// Mark setup as complete
def setupWizard = jenkins.getSetupWizard()
if (setupWizard != null) {
    setupWizard.markSetupComplete()
    println "Jenkins setup wizard marked as complete"
}

jenkins.save()