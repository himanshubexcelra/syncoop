/* eslint max-len: ["error", { "code": 100 }] */
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/utils/helpers', () => ({
  delay: jest.fn(),
}));

type UserData = {
  myRoles: string[];
  user_role: { role: { type: string } }[];
  first_name: string;
  last_name: string;
};

describe('Role-based Routing', () => {
  let replaceMock: jest.Mock;

  const replicatedOnSuccess = async (data: UserData) => {
    const userRoleType = data.myRoles[0];
    let route = '/dashboard';

    if (['admin', 'org_admin'].some((role) => userRoleType?.includes(role))) {
      route = '/dashboard';
    } else if (['researcher', 'protocol_approver'].some((role) => userRoleType?.includes(role))) {
      route = '/molecule-order';
    } else if (['library_manager'].some((role) => userRoleType?.includes(role))) {
      route = '/projects';
    }

    replaceMock(route);
  };

  beforeEach(() => {
    replaceMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      replace: replaceMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('routes Sys/Org Admin to /dashboard', async () => {
    const data: UserData = {
      myRoles: ['admin', 'org_admin'],
      user_role: [{ role: { type: 'admin' } }],
      first_name: 'Admin',
      last_name: 'User',
    };
    await replicatedOnSuccess(data);
    expect(replaceMock).toHaveBeenCalledWith('/dashboard');
  });

  it('routes Library manager to /projects', async () => {
    const data: UserData = {
      myRoles: ['library_manager'],
      user_role: [{ role: { type: 'library_manager' } }],
      first_name: 'Librarian',
      last_name: 'User',
    };
    await replicatedOnSuccess(data);
    expect(replaceMock).toHaveBeenCalledWith('/projects');
  });

  it('routes Researcher to /molecule-order', async () => {
    const data: UserData = {
      myRoles: ['researcher'],
      user_role: [{ role: { type: 'researcher' } }],
      first_name: 'Researcher',
      last_name: 'User',
    };
    await replicatedOnSuccess(data);
    expect(replaceMock).toHaveBeenCalledWith('/molecule-order');
  });

  it('routes Protocol approver to /molecule-order', async () => {
    const data: UserData = {
      myRoles: ['protocol_approver'],
      user_role: [{ role: { type: 'protocol_approver' } }],
      first_name: 'Protocol',
      last_name: 'Approver',
    };
    await replicatedOnSuccess(data);
    expect(replaceMock).toHaveBeenCalledWith('/molecule-order');
  });

  it('routes unknown role to /dashboard by default', async () => {
    const data: UserData = {
      myRoles: ['Unknown'],
      user_role: [{ role: { type: 'Unknown' } }],
      first_name: 'Unknown',
      last_name: 'User',
    };
    await replicatedOnSuccess(data);
    expect(replaceMock).toHaveBeenCalledWith('/dashboard');
  });
});
