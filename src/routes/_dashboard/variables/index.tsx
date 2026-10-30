import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useVariableActions } from '@/components/variable/use-variable-actions';
import { VariableFormDialog } from '@/components/variable/variable-form-dialog';
import { VariableListTable } from '@/components/variable/variable-list-table';
import { customVariablesOptions } from '@/queries/variable/options';

export const Route = createFileRoute('/_dashboard/variables/')({
  component: VariablesPage,
  staticData: { crumb: 'Хувьсагч' },
});

function VariablesPage() {
  const { data, isPending, error } = useQuery(customVariablesOptions());
  const actions = useVariableActions();

  return (
    <>
      <PageTitle
        title="Хувьсагч"
        description="Олон загварт давтагддаг текстийг нэг удаа бичээд загварын хоосон зайд холбоно. Утгыг солиход шинэ гэрээнд л нөлөөлнө."
        action={
          <VariableFormDialog
            onSubmit={actions.create}
            trigger={
              <Button>
                <PlusIcon />
                Хувьсагч нэмэх
              </Button>
            }
          />
        }
      />
      <Card className="gap-0 py-0">
        <VariableListTable
          items={data}
          isPending={isPending}
          error={error}
          onUpdate={actions.update}
          onDelete={actions.remove}
        />
      </Card>
    </>
  );
}
