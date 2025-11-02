import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import authClient from '@/lib/http';
import { 
  Package, TrendingUp, Wrench, AlertCircle,
  Search, RefreshCw, User, Calendar, CheckCircle, XCircle
} from 'lucide-react';

interface AssetStats {
  total_assets: number;
  total_value: number;
  status_breakdown: {
    available: number;
    assigned: number;
    maintenance: number;
    retired: number;
    damaged: number;
    lost: number;
  };
  condition_breakdown: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  category_breakdown: Array<{
    category__name: string;
    count: number;
    total_value: number;
  }>;
}

interface Asset {
  id: number;
  asset_code: string;
  name: string;
  category: number;
  category_name: string;
  description: string;
  purchase_date: string;
  purchase_price: string;
  current_value: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired' | 'damaged' | 'lost';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  serial_number?: string;
  model_number?: string;
  manufacturer?: string;
  warranty_expiry?: string;
  current_assignment?: {
    employee_id: number;
    employee_name: string;
    assigned_date: string;
    expected_return_date?: string;
  };
  depreciation_amount: number;
  age_years: number;
}

interface AssetAssignment {
  id: number;
  asset: number;
  asset_details: {
    asset_code: string;
    name: string;
    category: string;
  };
  employee: number;
  employee_name: string;
  employee_id_number: string;
  assigned_date: string;
  expected_return_date?: string;
  returned_date?: string;
  condition_at_assignment: string;
  condition_at_return?: string;
  notes: string;
  is_active: boolean;
  days_assigned: number;
}

interface AssetMaintenance {
  id: number;
  asset: number;
  asset_details: {
    asset_code: string;
    name: string;
    category: string;
    status: string;
  };
  maintenance_type: string;
  description: string;
  scheduled_date: string;
  completed_date?: string;
  cost: string;
  vendor: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes: string;
  overdue: boolean;
}

export default function AssetManagement() {
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [maintenances, setMaintenances] = useState<AssetMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter, categoryFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch asset statistics
      const statsRes = await authClient.get('/api/admin/assets/statistics/');
      setStats(statsRes.data);

      // Fetch assets
      let assetsUrl = '/api/admin/assets/';
      const params = [];
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
      if (categoryFilter !== 'all') params.push(`category_id=${categoryFilter}`);
      if (params.length > 0) assetsUrl += `?${params.join('&')}`;
      
      const assetsRes = await authClient.get(assetsUrl);
      setAssets(assetsRes.data.results || assetsRes.data);

      // Fetch assignments
      const assignmentsRes = await authClient.get('/api/admin/asset-assignments/?is_active=true');
      setAssignments(assignmentsRes.data.results || assignmentsRes.data);

      // Fetch maintenances
      const maintenancesRes = await authClient.get('/api/admin/asset-maintenance/?status=scheduled,in_progress');
      setMaintenances(maintenancesRes.data.results || maintenancesRes.data);
    } catch (error) {
      console.error('Error fetching asset data:', error);
      toast.error('Failed to load asset data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      available: 'bg-green-500',
      assigned: 'bg-blue-500',
      maintenance: 'bg-yellow-500',
      retired: 'bg-gray-500',
      damaged: 'bg-red-500',
      lost: 'bg-red-700'
    };
    return (
      <Badge className={statusColors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getConditionBadge = (condition: string) => {
    const conditionColors: Record<string, string> = {
      excellent: 'bg-green-600',
      good: 'bg-blue-600',
      fair: 'bg-yellow-600',
      poor: 'bg-red-600'
    };
    return (
      <Badge className={conditionColors[condition]}>
        {condition.charAt(0).toUpperCase() + condition.slice(1)}
      </Badge>
    );
  };

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: string | number) => {
    return `₹${parseFloat(amount.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Asset Management</h1>
          <p className="text-muted-foreground">
            Track institutional assets, assignments, and maintenance
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_assets}</div>
              <p className="text-xs text-muted-foreground">
                In inventory
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_value)}</div>
              <p className="text-xs text-muted-foreground">
                Current valuation
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.status_breakdown.assigned}</div>
              <p className="text-xs text-muted-foreground">
                {stats.status_breakdown.available} available
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.status_breakdown.maintenance}</div>
              <p className="text-xs text-muted-foreground">
                Under maintenance
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {stats?.category_breakdown.map((cat, idx) => (
                        <SelectItem key={idx} value={cat.category__name}>
                          {cat.category__name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Assets ({filteredAssets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead className="text-right">Current Value</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow 
                      key={asset.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <TableCell className="font-mono">{asset.asset_code}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          {asset.current_assignment && (
                            <div className="text-xs text-muted-foreground">
                              Assigned to {asset.current_assignment.employee_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{asset.category_name}</TableCell>
                      <TableCell>{new Date(asset.purchase_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div className="font-bold">{formatCurrency(asset.current_value)}</div>
                          <div className="text-xs text-muted-foreground">
                            -{formatCurrency(asset.depreciation_amount)} dep.
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getConditionBadge(asset.condition)}</TableCell>
                      <TableCell>{getStatusBadge(asset.status)}</TableCell>
                      <TableCell>{asset.location}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Assignments ({assignments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Condition</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{assignment.asset_details.name}</div>
                          <div className="text-xs text-muted-foreground">{assignment.asset_details.asset_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{assignment.employee_name}</div>
                          <div className="text-xs text-muted-foreground">{assignment.employee_id_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(assignment.assigned_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {assignment.expected_return_date 
                          ? new Date(assignment.expected_return_date).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{assignment.days_assigned} days</TableCell>
                      <TableCell>{getConditionBadge(assignment.condition_at_assignment)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled & In Progress Maintenance ({maintenances.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenances.map((maintenance) => (
                    <TableRow key={maintenance.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{maintenance.asset_details.name}</div>
                          <div className="text-xs text-muted-foreground">{maintenance.asset_details.asset_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>{maintenance.maintenance_type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {new Date(maintenance.scheduled_date).toLocaleDateString()}
                          {maintenance.overdue && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{maintenance.vendor || 'N/A'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(maintenance.cost)}</TableCell>
                      <TableCell>
                        <Badge className={maintenance.status === 'scheduled' ? 'bg-yellow-500' : 'bg-blue-500'}>
                          {maintenance.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Status Breakdown */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Available</span>
                      <Badge className="bg-green-500">{stats.status_breakdown.available}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Assigned</span>
                      <Badge className="bg-blue-500">{stats.status_breakdown.assigned}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Maintenance</span>
                      <Badge className="bg-yellow-500">{stats.status_breakdown.maintenance}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Retired</span>
                      <Badge className="bg-gray-500">{stats.status_breakdown.retired}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Damaged</span>
                      <Badge className="bg-red-500">{stats.status_breakdown.damaged}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Lost</span>
                      <Badge className="bg-red-700">{stats.status_breakdown.lost}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Condition Breakdown */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Condition Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Excellent</span>
                      <Badge className="bg-green-600">{stats.condition_breakdown.excellent}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Good</span>
                      <Badge className="bg-blue-600">{stats.condition_breakdown.good}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Fair</span>
                      <Badge className="bg-yellow-600">{stats.condition_breakdown.fair}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Poor</span>
                      <Badge className="bg-red-600">{stats.condition_breakdown.poor}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Category Breakdown */}
            {stats && stats.category_breakdown.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Assets by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Total Value</TableHead>
                        <TableHead className="text-right">Average Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.category_breakdown.map((cat, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{cat.category__name}</TableCell>
                          <TableCell className="text-right">{cat.count}</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(cat.total_value)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(cat.total_value / cat.count)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Asset Detail Dialog */}
      {selectedAsset && (
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedAsset.name}</DialogTitle>
              <DialogDescription>
                {selectedAsset.asset_code} • {selectedAsset.category_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedAsset.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Condition</Label>
                  <div>{getConditionBadge(selectedAsset.condition)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Purchase Date</Label>
                  <div className="font-medium">{new Date(selectedAsset.purchase_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Age</Label>
                  <div className="font-medium">{selectedAsset.age_years} years</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Purchase Price</Label>
                  <div className="font-medium">{formatCurrency(selectedAsset.purchase_price)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Current Value</Label>
                  <div className="font-medium text-primary">{formatCurrency(selectedAsset.current_value)}</div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Description</Label>
                <div className="text-sm mt-1">{selectedAsset.description}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {selectedAsset.serial_number && (
                  <div>
                    <Label className="text-muted-foreground">Serial Number</Label>
                    <div className="font-mono text-sm">{selectedAsset.serial_number}</div>
                  </div>
                )}
                {selectedAsset.model_number && (
                  <div>
                    <Label className="text-muted-foreground">Model</Label>
                    <div className="text-sm">{selectedAsset.model_number}</div>
                  </div>
                )}
                {selectedAsset.manufacturer && (
                  <div>
                    <Label className="text-muted-foreground">Manufacturer</Label>
                    <div className="text-sm">{selectedAsset.manufacturer}</div>
                  </div>
                )}
              </div>

              {selectedAsset.warranty_expiry && (
                <div>
                  <Label className="text-muted-foreground">Warranty Expiry</Label>
                  <div className="flex items-center gap-2">
                    <span>{new Date(selectedAsset.warranty_expiry).toLocaleDateString()}</span>
                    {new Date(selectedAsset.warranty_expiry) > new Date() ? (
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500">
                        <XCircle className="h-3 w-3 mr-1" />
                        Expired
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {selectedAsset.current_assignment && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Current Assignment</h4>
                  <div className="space-y-2">
                    <div>Assigned to: {selectedAsset.current_assignment.employee_name}</div>
                    <div>Since: {new Date(selectedAsset.current_assignment.assigned_date).toLocaleDateString()}</div>
                    {selectedAsset.current_assignment.expected_return_date && (
                      <div>Expected Return: {new Date(selectedAsset.current_assignment.expected_return_date).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Financial Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Purchase Price:</span>
                    <span className="font-medium">{formatCurrency(selectedAsset.purchase_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Value:</span>
                    <span className="font-medium">{formatCurrency(selectedAsset.current_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Depreciation:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(selectedAsset.depreciation_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Age:</span>
                    <span className="font-medium">{selectedAsset.age_years} years</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
