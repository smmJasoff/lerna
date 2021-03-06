import FileSystemUtilities from "./FileSystemUtilities";
import path from "path";
import padEnd from "lodash/padEnd";

export default class ExitHandler {
  constructor(cwd) {
    this.cwd = cwd;
    this.errorsSeen = {};
  }

  writeLogs(logger) {
    const filePath = path.join(this.cwd, "lerna-debug.log");
    const fileContent = this._formatLogs(logger.logs);

    FileSystemUtilities.writeFileSync(filePath, fileContent);
  }

  _formatLogs(logs) {
    return logs.map((log) => this._formatLog(log)).join("\n");
  }

  _formatLog(log) {
    return (
      this._formatType(log.type) +
      log.message +
      this._formatError(log.error)
    );
  }

  _formatType(type) {
    return padEnd("lerna(" + type + ")", 15);
  }

  _formatError(error) {
    if (!error || this.errorsSeen[error.toString()]) {
      return "";
    }

    let message = [];

    this.errorsSeen[error.toString()] = true;

    if (error) {
      message += (error.stack || error);
    }

    message = message.split("\n").map((line) => "    " + line).join("\n");

    return "\n" + message;
  }
}
