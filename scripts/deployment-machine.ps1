$script:DeploymentComputerName = "USERORG-H7SVV5V"

function Test-IsDeploymentMachine {
    return $env:COMPUTERNAME -eq $script:DeploymentComputerName
}

function Get-DeploymentComputerName {
    return $script:DeploymentComputerName
}
