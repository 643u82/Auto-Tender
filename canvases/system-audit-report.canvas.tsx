import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Grid,
  H1,
  H2,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
} from "cursor/canvas";

export default function SystemAuditReportCanvas() {
  return (
    <Stack gap={16} style={{ padding: 20 }}>
      <Stack gap={6}>
        <H1>System Audit Report</H1>
        <Text tone="secondary">
          Host: bena-HP-EliteBook-850-G6 | Scope: OS + runtime + Car Tender repo |
          Generated: 2026-05-28 13:35 UTC+3
        </Text>
      </Stack>

      <Grid columns={4} gap={12}>
        <Stat value="2" label="Critical findings" tone="danger" />
        <Stat value="2" label="High findings" tone="warning" />
        <Stat value="3" label="Medium findings" tone="info" />
        <Stat value="0" label="Known npm vulns" tone="success" />
      </Grid>

      <Callout tone="danger" title="Executive Risk Snapshot">
        Immediate remediation is required for leaked secrets in `server/.env` and
        filesystem ownership anomalies around `/etc` and UFW files. Package
        vulnerability scan is clean, but secrets and hardening gaps dominate risk.
      </Callout>

      <H2>Priority Findings</H2>
      <Table
        headers={["Severity", "Finding", "Evidence", "Recommended action"]}
        rows={[
          [
            "Critical",
            "Production-like secrets committed in env file",
            "server/.env contains GOOGLE_CLIENT_SECRET and CLOUDINARY_URL with credential material",
            "Rotate all exposed keys/secrets now, purge from git history, move to secret manager and untracked env files",
          ],
          [
            "Critical",
            "System config ownership anomaly",
            "UFW check shows `/etc`, `/usr`, `/lib`, and `/etc/ufw/*` owned by uid 65534; ufw cannot read user.rules",
            "Boot trusted media, verify filesystem metadata, run fsck, restore canonical ownership/permissions, investigate tampering",
          ],
          [
            "High",
            "Kernel reports residual CPU side-channel exposure",
            "lscpu: Gather data sampling = Vulnerable; MMIO stale data = SMT vulnerable",
            "Apply latest BIOS/microcode + kernel updates, consider disabling SMT if threat model requires",
          ],
          [
            "High",
            "Dirty main branch with sensitive file modified",
            "git status shows modified server/.env and runtime code files on main",
            "Stop editing secrets in tracked files; add `.env` to ignore policy and use `.env.example`",
          ],
          [
            "Medium",
            "Runtime/tooling warning",
            "npm audit emits: Unknown env config `devdir`",
            "Clean npm config (`npm config list -l`, remove unsupported key) to avoid future breakage",
          ],
          [
            "Medium",
            "Memory pressure currently moderate-high",
            "free -h: 15Gi total, 10Gi used, 568Mi free, 5.3Gi available",
            "Review background workload and tune startup apps; monitor swap trend over time",
          ],
          [
            "Medium",
            "Limited hardening visibility in current context",
            "systemctl unavailable in execution context; firewall state cannot be validated due rule-read failure",
            "Run host-level checks outside sandbox: `systemctl --failed`, `ufw status verbose`, and service inventory",
          ],
        ]}
        rowTone={[
          "danger",
          "danger",
          "warning",
          "warning",
          "info",
          "info",
          "info",
        ]}
        columnAlign={["left", "left", "left", "left"]}
        striped
      />

      <H2>System Baseline</H2>
      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader trailing={<Pill tone="info" size="sm">OS</Pill>}>
            Platform
          </CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text>Linux Mint 22.3 (zena)</Text>
              <Text>Kernel: 6.17.0-29-generic</Text>
              <Text>Uptime at audit: 4h 21m</Text>
            </Stack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader trailing={<Pill tone="info" size="sm">Compute</Pill>}>
            Resource Capacity
          </CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text>CPU: Intel i7-8665U, 8 logical CPUs</Text>
              <Text>Memory: 15 GiB total, 5.3 GiB available</Text>
              <Text>Root disk: 348 GiB total, 46 GiB used (14%)</Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <H2>Network and Application Posture</H2>
      <Row gap={12} wrap>
        <Pill tone="success" active>
          npm audit (server/client): 0 prod vulnerabilities
        </Pill>
        <Pill tone="warning" active>
          2 localhost listeners detected (127.0.0.1)
        </Pill>
        <Pill tone="info" active>
          No public listening ports observed in sample
        </Pill>
      </Row>

      <Table
        headers={["Area", "Observed state", "Risk implication"]}
        rows={[
          [
            "Open sockets",
            "127.0.0.1:40859 and 127.0.0.1:37091 (Chromium-scoped)",
            "Low direct exposure; still validate browser extensions and local services",
          ],
          [
            "Git hygiene",
            "Modified: client/src/api/axios.js, server/.env, server/package.json",
            "Operational drift and potential accidental secret commits",
          ],
          [
            "Dependency security",
            "npm audit --omit=dev reports zero vulnerabilities",
            "Good baseline; keep lockfiles current and re-scan in CI",
          ],
        ]}
        columnAlign={["left", "left", "left"]}
        striped
      />

      <H2>30-60-90 Remediation Plan</H2>
      <Table
        headers={["Window", "Actions", "Success criteria"]}
        rows={[
          [
            "Next 30 minutes",
            "Rotate leaked credentials; revoke old keys; remove secrets from tracked files",
            "All leaked secrets invalidated and app operational with new secure env injection",
          ],
          [
            "Today",
            "Investigate and repair ownership anomalies on `/etc`, `/usr`, `/lib`, and UFW data files",
            "UFW and core admin tools run cleanly; ownership/permissions match distro defaults",
          ],
          [
            "This week",
            "Patch OS, firmware, and microcode; document accepted residual CPU risks",
            "Host reports latest updates and agreed hardening baseline",
          ],
          [
            "This month",
            "Add pre-commit secret scanning and CI dependency/security checks",
            "Automated controls prevent secret leakage and detect regressions early",
          ],
        ]}
        columnAlign={["left", "left", "left"]}
      />
    </Stack>
  );
}
