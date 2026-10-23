import { useState } from 'react';
import { generateBackup } from '../../services/api';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

const BackupManager = () => {
  const [loading, setLoading] = useState(false);
  const [backupFile, setBackupFile] = useState(null);
  const [error, setError] = useState('');

  const handleGenerateBackup = async () => {
    setLoading(true);
    setError('');
    setBackupFile(null);
    try {
      const data = await generateBackup();
      setBackupFile(data.file);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Database Backup Manager</h1>
      </div>

      <Card className="max-w-[600px]">
        <CardHeader>
          <CardTitle>Generate SQL Export</CardTitle>
          <p className="text-text-light mt-2">
            Create a full SQL dump of all portfolio tables including projects, gallery, and settings. This ensures your deployments and data are easily repeatable.
          </p>
        </CardHeader>

        <CardContent>
          {error && <div className="text-danger font-medium mb-4">{error}</div>}

          <Button variant="primary" onClick={handleGenerateBackup} disabled={loading}>
            {loading ? 'Generating Backup...' : 'Generate New Backup'}
          </Button>

          {backupFile && (
            <div className="mt-6 p-4 bg-primary/5 rounded-md border border-primary/10">
              <h3 className="mb-2 text-[16px] font-semibold text-primary">Backup Ready!</h3>
              <p className="text-text-light mb-4">File created: {backupFile}</p>
              <p className="text-[14px] font-bold text-on-surface">
                Saved in: backend/storage/backups/{backupFile}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManager;
