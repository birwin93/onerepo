import { batch, run } from '@onerepo/subprocess';
import type { IPackageManager } from './methods';

export const Npm = {
	install: async (): Promise<void> => {
		await run({
			name: 'Install dependencies',
			cmd: 'npm',
			args: ['install'],
		});
	},

	add: async (packages, opts = {}): Promise<void> => {
		const pkgs = Array.isArray(packages) ? packages : [packages];
		await run({
			name: 'Add packages',
			cmd: 'npm',
			args: ['install', ...pkgs, ...(opts?.dev ? ['--save-dev'] : [])],
		});
	},

	remove: async (packages): Promise<void> => {
		const pkgs = Array.isArray(packages) ? packages : [packages];
		await run({
			name: 'Remove packages',
			cmd: 'npm',
			args: ['uninstall', ...pkgs],
		});
	},

	publish: async (opts = {}): Promise<void> => {
		const { access, cwd, otp, tag, workspaces } = opts;
		await run({
			name: `Publish${workspaces?.length ? ` ${workspaces.join(', ')}` : ''}`,
			cmd: 'npm',
			args: [
				'publish',
				...(access ? ['--access', access] : []),
				...(tag ? ['--tag', tag] : []),
				...(otp ? ['--otp'] : []),
				...(workspaces?.length ? ['--workspaces', ...workspaces.map((ws) => ws.name)] : []),
				...(process.env.ONE_REPO_DRY_RUN === 'true' ? ['--dry-run'] : []),
			],
			opts: cwd ? { cwd: cwd } : {},
			runDry: true,
		});
	},

	publishable: async (workspaces): Promise<Array<string>> => {
		const responses = await batch(
			workspaces.map(({ name }) => ({
				name: `Get ${name} versions`,
				cmd: 'npm',
				args: ['info', name, 'name', 'versions', '--json'],
				runDry: true,
			}))
		);

		return [];
	},
} satisfies IPackageManager;
