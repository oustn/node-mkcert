import process from 'node:process';

abstract class Bin {
  abstract getMkcertBin(): Promise<string>;

  protected resolveMkcertTargetName() {
    const os = this.resolveTargetOs();
    const suffix = os === 'windows' ? '.exe' : '';

    const { arch, platform } = process;

    if (os === 'linux' && arch === 'arm') {
      return 'linux-arm';
    }

    switch (arch) {
      case 'x64':
        return `${os}-amd64${suffix}`;
      case 'arm64':
        return `${os}-arm64${suffix}`;
      default:
    }

    throw new Error(
      `Your architecture '${arch}' with platform '${platform}' is currently not supported.`,
    );
  }

  protected resolveTargetOs() {
    const { platform } = process;
    switch (true) {
      case platform.startsWith('win'):
        return 'windows';
      case platform.startsWith('linux'):
        return 'linux';
      case platform.startsWith('darwin'):
        return 'darwin';
      default:
    }

    throw new Error(`Your platform '${platform}' is currently not supported.`);
  }
}

export { Bin };
